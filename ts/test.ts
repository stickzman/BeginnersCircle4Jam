/// <reference path="camera.ts" />
const cam = new Camera()
const stage = cam.stage

PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init)

let player
function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet

    let platform = new PIXI.Graphics()
    platform.lineStyle(2, 0x000000000)
    platform.beginFill(0xFFFFFF)
    platform.drawCircle(0, 0, cam.height/2-10);
    platform.endFill()
    stage.addChild(platform)

    player = new Player(sheet.textures["player.png"])

    window.requestAnimationFrame(tick)
}

let frameCount = 0
function tick() {
    ++frameCount

    player.update()

    cam.render()
    window.requestAnimationFrame(tick)
}
