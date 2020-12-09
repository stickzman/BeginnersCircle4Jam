class Graphic extends PIXI.Graphics {
    constructor() {
        super()
        Camera.stage.addChild(this)
    }
}
