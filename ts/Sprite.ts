class Sprite extends PIXI.Sprite {
    static stage: PIXI.Container

    constructor(texture: PIXI.Texture) {
        super(texture)
        this.pivot.set(this.width/2, this.height/2)
        Sprite.stage.addChild(this)
    }
}
