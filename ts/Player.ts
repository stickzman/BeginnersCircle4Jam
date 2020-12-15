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
    indicator: PIXI.Sprite
    speed: number = 3
    collider: Collider
    state: PlayerState = PlayerState.MOVE
    pos = new Vector(0, 0)
    velocity = new Vector(0, 0)
    friction: number = .9
    knockBackMag: number = 15

    maxDashMag: number = 40
    startAimTime: number
    maxAimTime: number = 500

    lives: number = 10

    static hitSound = new Howl({
        src: ['./assets/audio/hit.wav']
    })
    static fallSound = new Howl({
        src: ['./assets/audio/fall.wav'],
        volume: 0.5
    })
    static attackSound = new Howl({
        src: ['./assets/audio/attack.wav'],
        volume: 0.5
    })
    static smallHitSound = new Howl({
        src: ['./assets/audio/smallhit.wav'],
        volume: 0.25
    })

    private _r: number
    private initialRadius: number

    constructor(radius: number = 15) {
        super("player")
        this.indicator = new Sprite(globalThis.spritesheet.textures["arrow.png"])
        this.sprite = new Sprite(globalThis.spritesheet.textures["player.png"])
        this.sprite.zIndex = 1
        this.collider = new Collider(this, radius)
        this.indicator.pivot.set(this.indicator.width/2, this.indicator.height + 10)
        this.indicator.width = 25
        this.indicator.height = 0
        this.collider.on("exit", (col: Collider) => {
            if (col.gameObj.tag === "platform") {
                this.state = PlayerState.DEAD
                this.initialRadius = this.radius
                Player.fallSound.play()
            }
        })
        this.collider.on("enter", (col: Collider) => {
            if (this.state === PlayerState.DEAD) return // Do nothing if dead
            if (col.gameObj.tag === "enemy") {
                const e = <Enemy>col.gameObj
                if (e.state === EnemyState.DEAD || e.state === EnemyState.INACTIVE) return
                e.state = EnemyState.KNOCK_BACK
                // Circle collision resolution/bouncing
                const collisionVector = Vector.fromPoints(this.collider.x, this.collider.y, col.x, col.y).normalize()
                const faster = this.velocity.mag > e.velocity.mag
                if (faster) {
                    if (this.state === PlayerState.DASH) {
                        Enemy.combo = 1
                        e.combo = 1
                        // Angle enemy sprite towards player
                        e.sprite.angle = this.sprite.angle
                        globalThis.cam.shake = .5 * (this.velocity.mag/this.maxDashMag + 0.1)
                        globalThis.frameHalt = 5
                        // Enemy rebound velocity
                        e.velocity.set(Vector.mult(collisionVector, this.velocity.mag))
                        Player.attackSound.play()
                        e.state = EnemyState.DASH_KNOCK_BACK
                        globalThis.score += 5
                    } else {
                        Player.smallHitSound.play()
                    }
                    // Player rebound velocity
                    this.velocity.set(Vector.mult(collisionVector, -1))

                } else {
                    globalThis.cam.shake = 0.35
                    globalThis.frameHalt = 5
                    if (this.state !== PlayerState.KNOCK_BACK) {
                        // Only add velocity if the player was not already hit
                        this.velocity.set(Vector.mult(collisionVector, -this.knockBackMag))
                    }
                    e.velocity.set(Vector.mult(collisionVector, 1))
                    Player.hitSound.play()
                }

                this.state = PlayerState.KNOCK_BACK
            }
        })
        this.radius = radius
        this.initialRadius = radius
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

    get screenPos(): PIXI.Point {
        return globalThis.cam.getScreenPos(this.sprite)
    }

    lookAt(x: number, y: number) {
        // Get player screen cooridinates
        const p = this.screenPos
        // Find angle of rotation
        const rotation = Math.atan2(x - p.x, p.y - y)
        this.sprite.rotation = rotation
        this.indicator.rotation = rotation
    }

    update() {
        switch (this.state) {
            case PlayerState.DEAD: {
                // Shrink player (like they're falling)
                this.radius -= 0.5
                this.sprite.angle += 6
                if (this.radius <= 0) {
                    if (Tutorial.running || --this.lives > 0) this.respawn()
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
                // Calculate magnitude of dash based on time since aim start
                const aimTime = performance.now() - this.startAimTime
                const percent = Math.min(1, Math.sqrt(aimTime/this.maxAimTime))
                this.indicator.height = 100 * percent
                // Release Left Mouse
                if (!globalThis.LEFT_MOUSE) {
                    const dashMag = this.maxDashMag * percent
                    this.indicator.height = 0

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
                break
            }
            case PlayerState.KNOCK_BACK: {
                this.indicator.height = 0
                if (this.velocity.mag < 0.5) {
                    this.state = PlayerState.MOVE
                }
                break
            }
        }

        if (frameHalt > 0) return // Don't change position

        // Stretch sprite
        if (this.state !== PlayerState.DEAD)
            this.sprite.width = this.radius*2 - ((this.radius+5) * (this.velocity.mag/this.maxDashMag))

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
        // Check for any enemies in spawn point and move them
        const enemiesAtSpawn = Collider.circleCheck(0, 0, this.initialRadius, "enemy")
        for (const c of enemiesAtSpawn) {
            const e = <Enemy>c.gameObj
            const dir = Vector.fromPoints(0, 0, c.x, c.y)
            dir.mag = 25
            e.pos.set(dir.mag)
        }
        this.state = PlayerState.MOVE
        this.x = 0
        this.y = 0
        this.velocity.set(0, 0)
        this.radius = this.initialRadius
        Enemy.combo = 1
    }

    reInitialize() {
        globalThis.cam.stage.addChild(this.indicator)
        globalThis.cam.stage.addChild(this.sprite)
        Collider.allColliders.push(this.collider)
    }
}
