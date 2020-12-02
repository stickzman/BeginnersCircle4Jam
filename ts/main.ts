/// <reference path="Camera.ts" />
/// <reference path="Collider.ts" />

const cam = new Camera()
const stage = Camera.stage

PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init)

let player
function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet

    new Platform()

    player = new Player(sheet.textures["player.png"])
    player.collider.on("exit", col => {
        if (col.gameObj.tag === "platform") console.log("YOU DIED")
    })

    window.requestAnimationFrame(tick)
}

let frameCount = 0
function tick() {
    ++frameCount

    Collider.update()
    player.update()

    cam.render()
    window.requestAnimationFrame(tick)
}
