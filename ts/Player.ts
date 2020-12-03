/// <reference path="./GameObject.ts" />
enum PlayerState {
    DEAD,
    MOVE,
    AIM,
    DASH,
    KNOCK_BACK
}

class Player extends GameObject {
    sprite: PIXI.Sprite
    speed: number = 3
    collider: Collider
    state: PlayerState = PlayerState.MOVE
    velocity = new Vector(0, 0)
    friction: number = .9

    maxDashMag: number = 30
    startAimTime: number
    maxAimTime: number = 900

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
        this.collider.on("enter", (col: Collider) => {
            if (col.gameObj.tag === "enemy") {
                const e = <Enemy>col.gameObj
                // TODO: Circle collision resolution/bouncing
                const collisionVector = Vector.fromPoints(this.collider.x, this.collider.y, col.x, col.y).normalize()
                const vel = this.velocity.mag
                // Player rebound velocity
                this.velocity.set(Vector.mult(collisionVector, -vel/2))
                // Enemy rebound velocity
                e.velocity.set(collisionVector.mult(vel))

                this.state = PlayerState.KNOCK_BACK
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
                    this.startAimTime = performance.now()
                }

                break
            }
            case PlayerState.AIM: {
                // Release Left Mouse
                if (!globalThis.LEFT_MOUSE) {
                    // Calculate magnitude of dash based on time since aim start
                    const aimTime = performance.now() - this.startAimTime
                    const dashPerc = Math.min(1, aimTime/this.maxAimTime)
                    const dashMag = this.maxDashMag * dashPerc
                    console.log(dashPerc, dashMag)

                    const p = this.screenPos
                    const v = Vector.fromPoints(p.x, p.y, globalThis.mouseX, globalThis.mouseY)
                    this.velocity.set(v.normalize().mult(dashMag))

                    this.state = PlayerState.DASH
                }
                break
            }
            case PlayerState.DASH: {
                if (globalThis.LEFT_MOUSE) {
                    this.state = PlayerState.AIM
                    this.startAimTime = performance.now()
                } else if (this.velocity.mag < this.speed/2) {
                    this.state = PlayerState.MOVE
                }
            }
            case PlayerState.KNOCK_BACK: {
                if (this.velocity.mag < 1) {
                    this.state = PlayerState.MOVE
                }
            }
        }

        // Update position
        this.x += this.velocity.x
        this.y += this.velocity.y

        // Update velocity
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
        this.velocity.set(0, 0)
        this.radius = this.initialRadius
    }
}
