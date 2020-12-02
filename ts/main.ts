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

    let platform = new PIXI.Graphics()
    platform.lineStyle(2, 0x000000000)
    platform.beginFill(0xFFFFFF)
    platform.drawCircle(0, 0, cam.height/2-10)
    platform.endFill()
    stage.addChild(platform)

    new Collider(new GameObject("col1"), 100, 200, 10)
    new Collider(new GameObject("col2"), 10, -100, -200)

    player = new Player(sheet.textures["player.png"])
    player.collider.on("enter", col => {
        console.log("enter!", col.gameObj.tag)
    })
    player.collider.on("exit", col => {
        console.log("exit!", col.gameObj.tag)
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
