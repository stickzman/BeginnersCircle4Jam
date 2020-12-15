/// <reference path="./Sprite.ts" />
/// <reference path="./Vector.ts" />
PIXI.settings.SORTABLE_CHILDREN = true

class Camera {
    shake: number = 0 // Between 0 and 1
    private maxShakeOffset: number = 20
    private shakeDecrease = 0.02

    readonly renderer: PIXI.Renderer
    readonly width: number
    readonly height: number


    stage: PIXI.Container
    private readonly rotationLayer: PIXI.Container
    private readonly UILayer: PIXI.Container
    private pos: Vector = new Vector(0, 0)

    constructor(selector = "body", x = 0, y = 0) {
        this.renderer = PIXI.autoDetectRenderer()
        this.renderer.backgroundColor = 0x010203
        document.querySelector(selector).appendChild(this.renderer.view)

        this.width = this.renderer.width
        this.height = this.renderer.height

        this.stage = new PIXI.Container()

        this.rotationLayer = new PIXI.Container()
        this.rotationLayer.addChild(this.stage)
        this.rotationLayer.pivot.set(this.renderer.width/2, this.renderer.height/2)
        this.rotationLayer.x = this.renderer.width/2
        this.rotationLayer.y = this.renderer.height/2

        this.UILayer = new PIXI.Container()
        this.UILayer.addChild(this.rotationLayer)

        this.x = x
        this.y = y
    }

    set x(x: number) {
        this.pos.x = x
        this.stage.x = this.width/2 - x
    }

    get x(): number {
        return this.pos.x
    }

    set y(y: number) {
        this.pos.y = y
        this.stage.y = this.height/2 - y
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

    resize(width?: number, height?: number) {
        const oldWidth = this.width
        const oldHeight = this.height
        if (width === undefined || height === undefined) {
            const view = this.renderer.view.getBoundingClientRect()
            width = view.width
            height = view.height
        }

        this.renderer.resize(width, height)
        this.UILayer.scale.set(width/oldWidth, height/oldHeight)
    }

    getScreenPos(sprite: PIXI.Sprite): PIXI.Point {
        const p = sprite.getGlobalPosition()
        const c = this.renderer.view.getBoundingClientRect()
        p.x += c.left
        p.y += c.top
        return p
    }

    target(container: PIXI.Container) {
        this.x = container.x
        this.y = container.y
    }

    addText(text: string, style: object | PIXI.TextStyle, x = 0, y = 0): PIXI.Text {
        const t = new PIXI.Text(text, style)
        t.roundPixels = true
        t.x = x
        t.y = y
        this.UILayer.addChild(t)
        return t
    }

    render() {
        if (this.shake > 0) {
            const offsetX = this.maxShakeOffset * this.shake**2 * (Math.random() * 2 - 1)
            const offsetY = this.maxShakeOffset * this.shake**2 * (Math.random() * 2 - 1)
            this.stage.x = this.x + this.width/2 - offsetX
            this.stage.y = this.y + this.height/2 - offsetY
            this.shake -= this.shakeDecrease
        }
        this.renderer.render(this.UILayer)
    }
}
