/// <reference path="./GameObject.ts" />
enum PlayerState {
    DEAD,
    MOVE,
    AIM,
    DASH
}

class Player extends GameObject {
    sprite: PIXI.Sprite
    speed: number = 5
    collider: Collider
    state: PlayerState = PlayerState.MOVE
    velocity = new Vector(0, 0)
    friction: number = .9
    maxDashMag: number = 50

    private _x: number = 0
    private _y: number = 0
    private _r: number
    private initialRadius: number

    constructor(img: PIXI.Texture, radius: number = 15) {
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

    get screenPos(): PIXI.Point {
        return this.sprite.getGlobalPosition()
    }

    lookAt(x: number, y: number) {
        // Get player screen cooridinates
        const p = this.screenPos
        // Find angle of rotation
        const rotation = Math.atan2(x - p.x, p.y - y)
        this.sprite.rotation = rotation
    }

    update() {
        switch (this.state) {
            case PlayerState.DEAD: {
                // Shrink player (like they're falling)
                this.radius -= 0.5
                this.sprite.angle += 3
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
                }

                if (globalThis.LEFT) {
                    this.velocity.x = -player.speed
                } else if (globalThis.RIGHT) {
                    this.velocity.x = player.speed
                }

                if (globalThis.LEFT_MOUSE) {
                    this.state = PlayerState.AIM
                }

                break
            }
            case PlayerState.AIM: {
                // Release Left Mouse
                if (!globalThis.LEFT_MOUSE) {
                    const p = this.screenPos
                    const v = Vector.fromPoints(p.x, p.y, globalThis.mouseX, globalThis.mouseY)
                    this.velocity.set(v.normalize().mult(this.maxDashMag))

                    this.state = PlayerState.DASH
                }
                break
            }
            case PlayerState.DASH: {
                if (globalThis.LEFT_MOUSE) {
                    this.state = PlayerState.AIM
                } else if (this.velocity.mag < this.speed/2) {
                    this.state = PlayerState.MOVE
                }
            }
        }

        // Update velocity
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.velocity.x *= this.friction
        this.velocity.y *= this.friction
        if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0
        if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0

        if (this.state !== PlayerState.DEAD)
            player.lookAt(globalThis.mouseX, globalThis.mouseY)
    }

    respawn() {
        this.state = PlayerState.MOVE
        this.x = 0
        this.y = 0
        this.velocity.reset()
        this.radius = this.initialRadius
    }
}
