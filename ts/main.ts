/// <reference path="Camera.ts" />
/// <reference path="Collider.ts" />

var Howl: any

let cam = new Camera()
var player: Player
let platform: Platform

PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init)

function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet
    globalThis.spritesheet = sheet

    platform = new Platform()
    player = new Player()

    // Enemy.spawn(5)
    new Enemy(50, 0)
    new Enemy(100, 0)
    new Enemy(150, 0)
    new Enemy(200, 0)
    new Enemy(250, 0)

    window.requestAnimationFrame(tick)
}

function reset() {
    Enemy.clear()
    player.respawn()
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
