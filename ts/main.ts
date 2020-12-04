/// <reference path="Camera.ts" />
/// <reference path="Collider.ts" />

const cam = new Camera()
const stage = Camera.stage

PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init)

let player, enemy
let lastTimestamp: number
function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet
    globalThis.spritesheet = sheet

    new Platform()
    enemy = new Enemy(100, 100)

    player = new Player(sheet.textures["player.png"])
    player.collider.on("exit", col => {
        if (col.gameObj.tag === "platform") console.log("YOU DIED")
    })

    lastTimestamp = performance.now()
    window.requestAnimationFrame(tick)
}

var deltaTime
function tick(time: number) {
    deltaTime = time - lastTimestamp

    Collider.update()
    player.update()
    enemy.update()

    cam.render()

    lastTimestamp = time
    window.requestAnimationFrame(tick)
}
