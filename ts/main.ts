/// <reference path="Camera.ts" />
/// <reference path="Collider.ts" />

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

let cam = new Camera()
var player: Player
let platform: Platform
let level = 0
var score = 0
let scoreBoard: PIXI.Text
let highScore: string | number = localStorage.getItem("highScore")
highScore = (highScore) ? parseInt(highScore) : 0
let highScoreBoard: PIXI.Text
let gameOverScreen: PIXI.Text
let levelText: PIXI.Text
let livesCounter: PIXI.Text
let floatScore: PIXI.Text

var flashScore = function(score: number, x: number, y: number, color: number = 0xFFFFFF) {
    floatScore.text = (score > 0) ? "+" + score.toString() : score.toString()
    x = Math.min(cam.width - floatScore.width - 10, x)
    x = Math.max(10, x)
    y = Math.min(cam.height - floatScore.height - 10, y)
    y = Math.max(10, y)
    floatScore.x = x
    floatScore.y = y
    floatScore.alpha = 1
    floatScore.style.fill = 0x3083dc
}

WebFont.load({
    google: {
        families: ['Press Start 2P']
    },
    active: e => {
        PIXI.Loader.shared
            .add("sheet", "./spritesheets/sheet.json")
            .load(init)

        scoreBoard = cam.addText("Score:\n\n0", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "fontSize": "20px"
        }, 25, 25)
        highScoreBoard = cam.addText("High\nScore:\n\n" + highScore, {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "fontSize": "20px"
        }, 25, 0)
        highScoreBoard.y = cam.height - highScoreBoard.height - 25
        livesCounter = cam.addText("Lives:\n\n0", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "align": "center",
            "fontSize": "20px"
        }, 0, 0)
        livesCounter.y = cam.height - livesCounter.height - 25
        livesCounter.x = cam.width - livesCounter.width - 25
        levelText = cam.addText("Level\n\n0", {
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
        gameOverScreen = cam.addText("Game Over!\n\n\n\nPress\n\nSpacebar\n\nto play again", {
            "fontFamily": "Press Start 2P",
            "fill": 0x000000,
            "fontSize": "32px",
            "align": "center"
        },)
        gameOverScreen.x = cam.width/2 - gameOverScreen.width/2
        gameOverScreen.y = cam.height/2 - gameOverScreen.height/2
        gameOverScreen.alpha = 0
    }
})

function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet
    globalThis.spritesheet = sheet

    platform = new Platform()
    player = new Player()

    // new Enemy(50, 0)
    // new Enemy(100, 0)
    // new Enemy(150, 0)
    // new Enemy(200, 0)
    // new Enemy(250, 0)
    // new Enemy(300, 0)

    window.requestAnimationFrame(tick)
}

var frameID: number
var frameHalt = 0
let gameOver = false
function tick() {
    if (frameHalt > 0) {
        --frameHalt
        frameID = window.requestAnimationFrame(tick)
        cam.render()
        return
    }

    score = (score < 0) ? 0 : score
    scoreBoard.text = "Score:\n\n" + score
    livesCounter.text = "Lives:\n\n" + player.lives
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
    player.update()
    for (const e of Enemy.enemies) {
        if (e.state === EnemyState.INACTIVE) {
            e.destroy()
            continue
        }
        e.update()
    }
    if (Enemy.enemies.length === 0) {
        levelText.text = "Level\n\n" + ++level
        Enemy.spawn((level * 2) - 1)
        if (level > 1) levelUpSound.play()
        // This is a bad way to do this but im short on time
        setTimeout(() => {
            levelText.alpha = 0
        }, 500)
        setTimeout(() => {
            levelText.alpha = 1
        }, 1000)
        setTimeout(() => {
            levelText.alpha = 0
        }, 1500)
        setTimeout(() => {
            levelText.alpha = 1
        }, 2000)
    }

    cam.render()

    if (player.lives <= 0) {
        Enemy.clear()
        gameOver = true
        gameOverScreen.alpha = 1
        gameOverSound.play()
        if (score > highScore) {
            localStorage.setItem("highScore", score.toString())
            highScore = score
            highScoreBoard.text = "High\nScore:\n\n" + highScore
        }
    }

    frameID = window.requestAnimationFrame(tick)
}

function reset() {
    Enemy.clear()
    player.lives = 3
    player.respawn()
    level = 0
    gameOver = false
    gameOverScreen.alpha = 0
    levelUpSound.play()
}

window.addEventListener("beforeunload", function() {
    if (score > highScore) localStorage.setItem("highScore", score.toString())
})
