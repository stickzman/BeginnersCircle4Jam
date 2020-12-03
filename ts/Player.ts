/// <reference path="./GameObject.ts" />
enum PlayerState {
    DEAD,
    MOVE
}

class Player extends GameObject {
    sprite: PIXI.Sprite
    speed: number = 350
    collider: Collider
    state: PlayerState = PlayerState.MOVE
    velocity = {
        x: 0,
        y: 0
    }

    private _x: number = 0
    private _y: number = 0
    private _r: number
    private initialRadius: number

    constructor(img: PIXI.Texture, radius: number = 25) {
        super("player")
        this.sprite = new Sprite(img)
        this.collider = new Collider(this, radius)
        this.collider.on("exit", (col: Collider) => {
            if (col.gameObj.tag === "platform") {
                this.state = PlayerState.DEAD
                this.initialRadius = this.radius
            }
        })
        this.radius = radius
        this.initialRadius = radius
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

    lookAt(x: number, y: number) {
        // Get player screen cooridinates
        const p = this.sprite.getGlobalPosition()
        // Find angle of rotation
        const rotation = Math.atan2(x - p.x, p.y - y)
        this.sprite.rotation = rotation
    }

    update(deltaTime: number) {
        deltaTime /= 1000 // Convert ms to sec

        switch (this.state) {
            case PlayerState.DEAD: {
                // Shrink player (like they're falling)
                this.radius -= 0.5
                if (this.radius <= 0) {
                    this.respawn()
                }
                break
            }
            case PlayerState.MOVE: {
                if (globalThis.UP) {
                    this.velocity.y = -player.speed
                } else if (globalThis.DOWN) {
                    this.velocity.y = player.speed
                } else {
                    this.velocity.y = 0
                }

                if (globalThis.LEFT) {
                    this.velocity.x = -player.speed
                } else if (globalThis.RIGHT) {
                    this.velocity.x = player.speed
                } else {
                    this.velocity.x = 0
                }

                this.x += this.velocity.x * deltaTime
                this.y += this.velocity.y * deltaTime

                player.lookAt(globalThis.mouseX, globalThis.mouseY)
                break
            }
        }
    }

    respawn() {
        this.state = PlayerState.MOVE
        this.x = 0
        this.y = 0
        this.radius = this.initialRadius
    }
}
