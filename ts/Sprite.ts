class Sprite extends PIXI.Sprite {
    constructor(texture: PIXI.Texture) {
        super(texture)
        this.pivot.set(this.width/2, this.height/2)
        Camera.stage.addChild(this)
    }
}
