class Sprite extends PIXI.Sprite {
    constructor(texture: PIXI.Texture, width?: number, height?:number) {
        super(texture)
        if (width !== undefined) {
            if (height === undefined) height = width
            this.width = width
            this.height = height
        }
        this.pivot.set(this.width/2, this.height/2)
        globalThis.cam.stage.addChild(this)
    }
}
