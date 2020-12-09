/// <reference path="./Sprite.ts" />
PIXI.settings.SORTABLE_CHILDREN = true

class Camera {
    readonly renderer: PIXI.Renderer
    readonly width: number
    readonly height: number
    static stage: PIXI.Container
    private readonly rotationLayer: PIXI.Container

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
        Camera.stage.x = this.width/2 - x
    }

    get x(): number {
        return this.width/2 - Camera.stage.x
    }

    set y(y: number) {
        Camera.stage.y = this.height/2 - y
    }

    get y(): number {
        return this.height/2 - Camera.stage.y
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
        this.renderer.render(this.rotationLayer)
    }
}
