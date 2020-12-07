class Platform extends GameObject {
    constructor() {
        super("platform")

        const graphic = new PIXI.Graphics()
        graphic.lineStyle(2, 0x000000000)
        graphic.beginFill(0xFFFFFF)
        graphic.drawCircle(0, 0, cam.height/2-10)
        graphic.endFill()
        Camera.stage.addChild(graphic)

        new Collider(this, cam.height/2-12)
    }
}