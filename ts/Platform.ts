class Platform extends GameObject {
    graphic: PIXI.Graphics
    collider: Collider

    constructor() {
        super("platform")

        this.graphic = new Graphic()
        this.graphic.beginFill(0xFFFFFF)
        this.graphic.drawCircle(0, 0, cam.height/2-10)
        this.graphic.endFill()

        this.collider = new Collider(this, cam.height/2-12)
    }

    reInitialize() {
        Camera.stage.addChild(this.graphic)
        Collider.allColliders.push(this.collider)
    }
}
