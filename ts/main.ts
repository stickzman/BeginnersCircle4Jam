/// <reference path="Camera.ts" />
/// <reference path="Collider.ts" />

const cam = new Camera()
const stage = Camera.stage
var player: Player
var enemy: Enemy
let lastTimestamp: number

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

    // Enemy.spawn(2)
    new Enemy(100, 0)
    new Enemy(50, 0)

    lastTimestamp = performance.now()
    window.requestAnimationFrame(tick)
}

var deltaTime
var frameID
function tick(time: number) {
    deltaTime = time - lastTimestamp

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

    lastTimestamp = time
    frameID = window.requestAnimationFrame(tick)
}
