/// <reference path="Camera.ts" />
/// <reference path="Collider.ts" />

var Howl: any

let cam = new Camera()
const stage = Camera.stage
var player: Player
var enemy: Enemy

PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init)

function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet
    globalThis.spritesheet = sheet

    new Platform()

    player = new Player(sheet.textures["player.png"])
    player.collider.on("exit", col => {
        if (col.gameObj.tag === "platform") console.log("YOU DIED")
    })

    Enemy.spawn(1)
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
function tick() {
    if (frameHalt > 0) {
        --frameHalt
        frameID = window.requestAnimationFrame(tick)
        cam.render()
        return
    }
    Collider.update()
    player.update()
    for (const [i, e] of Enemy.enemies.entries()) {
        if (e.state === EnemyState.INACTIVE) {
            Enemy.enemies.splice(i, 1)
            continue
        }
        e.update()
    }
    if (Enemy.enemies.length === 0) console.log("YOU WIN!")

    cam.render()

    frameID = window.requestAnimationFrame(tick)
}
