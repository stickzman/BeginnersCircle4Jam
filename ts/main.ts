/// <reference path="Camera.ts" />
/// <reference path="Collider.ts" />
/// <reference path="Tutorial.ts" />
/// <reference path="Timer.ts" />
/// <reference path="Enemy.ts" />
/// <reference path="Player.ts" />

var Howl: any
var WebFont: any

const levelUpSound = new Howl({
    src: ['./assets/audio/levelup.wav'],
    volume: 1
})
const gameOverSound = new Howl({
    src: ['./assets/audio/gameover.wav'],
    volume: 0.3
})

var cam = new Camera()
var player: Player
let platform: Platform
let level = 0
var score = 0
let highScore = 0
if (localStorage) highScore = parseInt(localStorage.getItem("highscore")) || 0
let oldHighScore = 0
let lastTimestamp = 0

let scoreBoard: PIXI.Text
let highScoreBoard: PIXI.Text
let gameOverScreen: PIXI.Text
let levelText: PIXI.Text
let livesCounter: PIXI.Text
let floatScore: PIXI.Text
let tutorialText: PIXI.Text
let tutorialSubtext: PIXI.Text

var flashScore = function(score: number, x: number, y: number, color: number = 0x3083dc) {
    floatScore.text = (score > 0) ? "+" + score.toString() : score.toString()
    x = Math.min(cam.width - floatScore.width - 10, x)
    x = Math.max(10, x)
    y = Math.min(cam.height - floatScore.height - 10, y)
    y = Math.max(10, y)
    floatScore.x = x
    floatScore.y = y
    floatScore.alpha = 1
    floatScore.style.fill = color
}

WebFont.load({
    google: {
        families: ['Press Start 2P']
    },
    active: e => {
        scoreBoard = cam.addText("Score:\n0", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "fontSize": "20px"
        }, 25, 25)
        highScoreBoard = cam.addText("High\nScore:\n" + highScore, {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "fontSize": "20px"
        }, 25, 0)
        highScoreBoard.y = cam.height - highScoreBoard.height - 25
        livesCounter = cam.addText("Lives:\n0", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "align": "center",
            "fontSize": "20px"
        }, 0, 0)
        livesCounter.y = cam.height - livesCounter.height - 25
        livesCounter.x = cam.width - livesCounter.width - 25
        levelText = cam.addText("Level\n0", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "align": "center",
            "fontSize": "20px"
        }, 0, 25)
        levelText.x = cam.width - levelText.width - 25
        floatScore = cam.addText("", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "alpha": 0,
            "fontSize": "20px"
        })
        gameOverScreen = cam.addText("Game Over!\n\nPress\nSpacebar\nto play again", {
            "fontFamily": "Press Start 2P",
            "fill": 0x000000,
            "fontSize": "32px",
            "align": "center"
        })
        gameOverScreen.x = cam.width/2 - gameOverScreen.width/2
        gameOverScreen.y = cam.height/2 - gameOverScreen.height/2
        gameOverScreen.alpha = 0

        tutorialText = cam.addText("Welcome to\nLast Man Standing!", {
            "fontFamily": "Press Start 2P",
            "fill": 0x000000,
            "fontSize": "24px",
            "align": "center"
        })
        tutorialText.x = cam.width/2 - tutorialText.width/2
        tutorialText.y = cam.height/2 - tutorialText.height - 50
        tutorialSubtext = cam.addText("Be careful not to\nthrow yourself off the platform!", {
            "fontFamily": "Press Start 2P",
            "fill": 0x000000,
            "fontSize": "14px",
            "align": "center"
        })
        tutorialSubtext.x = cam.width/2 - tutorialSubtext.width/2
        tutorialSubtext.y = cam.height/2 + tutorialSubtext.height + 100
        tutorialSubtext.alpha = 0


        PIXI.Loader.shared
            .add("sheet", "./spritesheets/sheet.json")
            .load(init)
    }
})

var frameID: number
function init(_, resources) {
    const sheet = resources["sheet"].spritesheet
    globalThis.spritesheet = sheet

    oldHighScore = highScore

    platform = new Platform()
    player = new Player()

    // new Enemy(50, 0)
    // new Enemy(100, 0)
    // new Enemy(150, 0)
    // new Enemy(200, 0)
    // new Enemy(250, 0)

    Timer.start("tutorialStart")
	lastTimestamp = performance.now()
	frameID = window.requestAnimationFrame(tutorialTick)
}

function tutorialTick(timestamp: DOMHighResTimeStamp) {
	const deltaTime = (timestamp - lastTimestamp) / 1000
	lastTimestamp = timestamp
    Tutorial.update()
    Collider.update()
	player.update(deltaTime)
    cam.render()

    if (Tutorial.running) {
        frameID = window.requestAnimationFrame(tutorialTick)
    } else {
        frameID = window.requestAnimationFrame(tick)
    }
}

var frameHalt = 0
let gameOver = false
function tick(timestamp: DOMHighResTimeStamp) {
	const deltaTime = (timestamp - lastTimestamp) / 1000
	lastTimestamp = timestamp

    if (frameHalt > 0) {
        --frameHalt
        frameID = window.requestAnimationFrame(tick)
        cam.render()
        return
    }

    score = (score < 0) ? 0 : score
    scoreBoard.text = "Score:\n" + score
    livesCounter.text = "Lives:\n" + player.lives
    if (floatScore.alpha > 0) {
        floatScore.alpha -= 0.01
    }

    if (gameOver) {
        if (globalThis.SPACE) reset()
        cam.render()
        frameID = window.requestAnimationFrame(tick)
        return
    }

    Collider.update()
	player.update(deltaTime)
	Enemy.update(deltaTime)
    if (Enemy.enemies.length === 0) {
        levelText.text = "Level\n" + ++level
        Enemy.spawn(level)
        levelUpSound.play()

        setTimeout(() => { levelText.alpha = 0 }, 500)
        setTimeout(() => { levelText.alpha = 1 }, 1000)
        setTimeout(() => { levelText.alpha = 0 }, 1500)
        setTimeout(() => { levelText.alpha = 1 }, 2000)
    }

    cam.render()

    if (score > highScore) {
        highScore = score
        highScoreBoard.text = "High\nScore:\n" + highScore
    }

    if (player.lives <= 0) {
        Enemy.clear()
        gameOver = true
        gameOverScreen.alpha = 1
        gameOverSound.play()
        if (highScore > oldHighScore) {
            setTimeout(() => { highScoreBoard.alpha = 0 }, 500)
            setTimeout(() => { highScoreBoard.alpha = 1 }, 1000)
            setTimeout(() => { highScoreBoard.alpha = 0 }, 1500)
            setTimeout(() => { highScoreBoard.alpha = 1 }, 2000)
        }
    }

    frameID = window.requestAnimationFrame(tick)
}

function reset() {
    Enemy.clear()
    player.lives = 10
    player.respawn()
    level = 0
    score = 0
    gameOver = false
    gameOverScreen.alpha = 0
    oldHighScore = highScore
    levelUpSound.play()
}

window.addEventListener("beforeunload", () => {
    if (localStorage) localStorage.setItem("highscore", highScore.toString())
})
