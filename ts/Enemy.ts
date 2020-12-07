/// <reference path="./GameObject.ts" />
class Enemy extends GameObject {
    sprite: PIXI.Sprite
    collider: Collider
    velocity = new Vector(0, 0)
    friction: number = .9

    private _x: number = 0
    private _y: number = 0
    private _r: number = 0

    constructor(x: number = 0, y: number = 0, radius: number = 20) {
        super("enemy")
        this.sprite = new Sprite(globalThis.spritesheet.textures["enemy.png"])
        this.collider = new Collider(this, radius)
        this.x = x
        this.y = y
        this.radius = radius
    }

    update() {
        // Update position
        this.x += this.velocity.x
        this.y += this.velocity.y

        // Update velocity
        this.velocity.x *= this.friction
        this.velocity.y *= this.friction
        if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0
        if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0

    }

    set x(x: number) {
        this._x = x
        this.sprite.x = x
        this.collider.x = x
    }
    get x(): number {
        return this._x
    }

    set y(y: number) {
        this._y = y
        this.sprite.y = y
        this.collider.y = y
    }
    get y(): number {
        return this._y
    }

    set radius(r: number) {
        this._r = r
        this.sprite.width = this.sprite.height = r * 2
        this.collider.radius = r
    }

    get radius(): number {
        return this._r
    }
}
