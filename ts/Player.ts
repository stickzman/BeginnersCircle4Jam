class Player {
    sprite: PIXI.Sprite
    speed: number = 5
    private _x: number = 0
    private _y: number = 0

    constructor(img: PIXI.Texture) {
        this.sprite = new Sprite(img)
    }

    set x(x: number) {
        this._x = x
        this.sprite.x = x
    }
    get x(): number {
        return this._x
    }

    set y(y: number) {
        this._y = y
        this.sprite.y = y
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
