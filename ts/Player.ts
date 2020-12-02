/// <reference path="./GameObject.ts" />

class Player extends GameObject {
    sprite: PIXI.Sprite
    speed: number = 5
    collider: Collider
    private _x: number = 0
    private _y: number = 0

    constructor(img: PIXI.Texture) {
        super("player")
        this.sprite = new Sprite(img)
        this.collider = new Collider(this, 45)
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

    lookAt(x: number, y: number) {
        // Get player screen cooridinates
        const p = this.sprite.getGlobalPosition()
        // Find angle of rotation
        const rotation = Math.atan2(x - p.x, p.y - y)
        this.sprite.rotation = rotation
    }

    update() {
        if (globalThis.UP) player.y -= player.speed
        if (globalThis.DOWN) player.y += player.speed
        if (globalThis.LEFT) player.x -= player.speed
        if (globalThis.RIGHT) player.x += player.speed

        player.lookAt(globalThis.mouseX, globalThis.mouseY)
    }
}
