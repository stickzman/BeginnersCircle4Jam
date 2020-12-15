class Graphic extends PIXI.Graphics {
    constructor() {
        super()
        globalThis.cam.stage.addChild(this)
    }
}
