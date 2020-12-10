/// <reference path="./Sprite.ts" />
/// <reference path="./Vector.ts" />
PIXI.settings.SORTABLE_CHILDREN = true

class Camera {
    static shake: number = 0 // Between 0 and 1
    private maxShakeOffset: number = 20
    private shakeDecrease = 0.02

    readonly renderer: PIXI.Renderer
    readonly width: number
    readonly height: number

    static stage: PIXI.Container

    private readonly rotationLayer: PIXI.Container
    private pos: Vector = new Vector(0, 0)

    constructor(selector = "body", x = 0, y = 0) {
        this.renderer = PIXI.autoDetectRenderer()
        this.renderer.backgroundColor = 0x010203
        document.querySelector(selector).appendChild(this.renderer.view)

        this.width = this.renderer.width
        this.height = this.renderer.height

        Camera.stage = new PIXI.Container()
        this.rotationLayer = new PIXI.Container()
        this.rotationLayer.addChild(Camera.stage)
        this.rotationLayer.pivot.set(this.renderer.width/2, this.renderer.height/2)
        this.rotationLayer.x = this.renderer.width/2
        this.rotationLayer.y = this.renderer.height/2

        this.x = x
        this.y = y
    }

    set x(x: number) {
        this.pos.x = x
        Camera.stage.x = this.width/2 - x
    }

    get x(): number {
        return this.pos.x
    }

    set y(y: number) {
        this.pos.y = y
        Camera.stage.y = this.height/2 - y
    }

    get y(): number {
        return this.pos.y
    }

    set angle(a: number) {
        this.rotationLayer.angle = a
    }

    get angle(): number {
        return this.rotationLayer.angle
    }

    target(container: PIXI.Container) {
        this.x = container.x
        this.y = container.y
    }

    render() {
        if (Camera.shake > 0) {
            const offsetX = this.maxShakeOffset * Camera.shake**2 * (Math.random() * 2 - 1)
            const offsetY = this.maxShakeOffset * Camera.shake**2 * (Math.random() * 2 - 1)
            Camera.stage.x = this.x + this.width/2 - offsetX
            Camera.stage.y = this.y + this.height/2 - offsetY
            Camera.shake -= this.shakeDecrease
        }
        this.renderer.render(this.rotationLayer)
    }
}
