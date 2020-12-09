/// <reference path="./GameObject.ts" />
enum EnemyState {
    DEAD,
    AIM,
    INACTIVE,
    KNOCK_BACK,
    DASH,
    REST,
    RECOVERY
}

class Enemy extends GameObject {
    static enemies: Enemy[] = []
    sprite: PIXI.Sprite
    indicator: PIXI.Graphics

    collider: Collider
    velocity = new Vector(0, 0)
    friction: number = .9
    state: EnemyState
    pos = new Vector(1, 1)

    target: Vector

    aimSpeed: number = 0.05
    chargeSpeed: number = 5
    maxChargeSpeed: number = 400
    dashMag: number = 250
    dashSpeed: number = 10
    dashEnd: Vector

    restTime: number = 0
    restStart: number = 0

    private _r: number = 0
    private _rot: number = 0

    constructor(x: number = 1, y: number = 1, radius: number = 20) {
        super("enemy")

        this.target = globalThis.player.pos

        this.indicator = new Graphic()
        this.indicator.lineStyle(5, 0xec1c24, 0.5)
        this.indicator.moveTo(0, 0)
        this.indicator.lineTo(0, -1)
        this.indicator.height = 0
        this.sprite = new Sprite(globalThis.spritesheet.textures["enemy.png"])
        this.collider = new Collider(this, radius)
        this.collider.on("enter", (col: Collider) => {
            if (col.gameObj.tag === "enemy") {
                const e = <Enemy>col.gameObj
                if (e.state === EnemyState.DEAD || e.state === EnemyState.INACTIVE) return
                // Circle collision resolution/bouncing
                const collisionVector = Vector.fromPoints(this.collider.x, this.collider.y, col.x, col.y).normalize()
                const faster = this.velocity.mag >= e.velocity.mag
                if (faster) {
                    // Enemy rebound velocity
                    e.velocity.set(Vector.mult(collisionVector, this.velocity.mag))
                    // Player rebound velocity
                    this.velocity.set(Vector.mult(collisionVector, -1))
                } else {
                    this.velocity.set(Vector.mult(collisionVector, -e.velocity.mag))
                    e.velocity.set(Vector.mult(collisionVector, 1))
                }

                this.state = EnemyState.KNOCK_BACK
                e.state = EnemyState.KNOCK_BACK
                col.touching.add(this.collider)
            }
        })
        this.radius = radius
        this.collider.on("exit", (col: Collider) => {
            if (col.gameObj.tag === "platform") {
                // 50% chance they 'catch' themselves before going over edge
                if (Math.random() < 0.5 && (this.state === EnemyState.DASH ||
                                          this.state === EnemyState.RECOVERY)
                ) {
                    this.velocity.normalize().mult(-5)
                    this.state = EnemyState.KNOCK_BACK
                } else {
                    this.state = EnemyState.DEAD
                }
            }
        })
        this.x = x
        this.y = y
        this.radius = radius
        this.state = EnemyState.KNOCK_BACK
        Enemy.enemies.push(this)
    }

    set x(x: number) {
        this.pos.x = x
        this.sprite.x = x
        this.indicator.x = x
        this.collider.x = x
    }
    get x(): number {
        return this.pos.x
    }

    set y(y: number) {
        this.pos.y = y
        this.sprite.y = y
        this.indicator.y = y
        this.collider.y = y
    }
    get y(): number {
        return this.pos.y
    }

    set radius(r: number) {
        this._r = r
        this.sprite.width = this.sprite.height = r * 2
        this.collider.radius = r
    }

    get radius(): number {
        return this._r
    }

    // Angle in radians
    set rotation(r: number) {
        this._rot = r
        this.sprite.rotation = r
        this.indicator.rotation = r
    }

    get rotation(): number {
        return this._rot
    }

    update() {
        switch (this.state) {
            case EnemyState.DEAD: {
                // Shrink player (like they're falling)
                this.radius -= 0.5
                this.sprite.angle += 3
                if (this.radius <= 0) {
                    this.state = EnemyState.INACTIVE
                }
                break
            }
            case EnemyState.AIM: {
                let angleAligned = false
                let rotClockwise: boolean
                // Aim towards target
                const angleOfRot = Math.atan2(this.target.x - this.x, this.y - this.target.y) + Math.PI
                const currRot = this.rotation + Math.PI
                const diff = (currRot - angleOfRot) % (2 * Math.PI)
                if (currRot > Math.PI) {
                    rotClockwise = (diff > Math.PI || diff < 0)
                } else {
                    rotClockwise = (diff < 0 && diff < Math.PI)
                }

                if (Math.abs(diff) < this.aimSpeed) {
                    angleAligned = true
                } else if (rotClockwise) {
                    this.rotation += this.aimSpeed
                } else {
                    this.rotation -= this.aimSpeed
                }
                // Pull back bow
                if (this.indicator.height < this.maxChargeSpeed) {
                    this.indicator.height += this.chargeSpeed
                } else if (angleAligned) {
                    // Enter dash
                    const v = Vector.fromVectors(this.pos, this.target)
                    this.velocity.set(v.normalize())
                    this.dashEnd = Vector.add(this.pos, v.mult(this.dashMag))

                    this.state = EnemyState.DASH
                }
                break
            }
            case EnemyState.RECOVERY:
            case EnemyState.KNOCK_BACK: {
                this.indicator.height = 0
                if (this.velocity.mag < 0.25) {
                    this.restStart = performance.now()
                    this.restTime = Math.random() * 2000
                    this.state = EnemyState.REST
                }
                break
            }
            case EnemyState.REST: {
                if (performance.now() - this.restStart > this.restTime) {
                    this.state = EnemyState.AIM
                }
                break
            }
            case EnemyState.DASH: {
                // this.indicator.height = 0
                this.x += this.velocity.x * this.dashSpeed
                this.y += this.velocity.y * this.dashSpeed
                if (Vector.dist(this.pos, this.dashEnd) < 2) {
                    this.velocity.mult(this.dashSpeed)
                    this.state = EnemyState.RECOVERY
                }
                break
            }
        }

        if (this.state == EnemyState.DASH) return // Don't do velocity in a dash
        // Update position
        this.x += this.velocity.x
        this.y += this.velocity.y

        // Update velocity
        this.velocity.x *= this.friction
        this.velocity.y *= this.friction
        if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0
        if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0
    }

    static spawn(numEnemies: number, radius: number = 250, minRadius: number = 75) {
        for (let i = 0; i < numEnemies; i++) {
            let r = Math.floor((Math.random() * (radius - minRadius)) + minRadius)
            let angle = Math.random() * 360
            let x = r * Math.sin(angle)
            let y = r * Math.cos(angle)
            new Enemy(x, y)
        }
    }
}
