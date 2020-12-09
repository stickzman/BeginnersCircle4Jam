/// <reference path="./GameObject.ts" />
enum EnemyState {
    DEAD,
    AIM,
    INACTIVE,
    KNOCK_BACK
}

class Enemy extends GameObject {
    static enemies: Enemy[] = []
    sprite: PIXI.Sprite
    indicator: PIXI.Graphics
    collider: Collider
    velocity = new Vector(0, 0)
    friction: number = .9
    state: EnemyState
    target: Vector
    aimSpeed: number = 0.01

    private _x: number = 0
    private _y: number = 0
    private _r: number = 0
    private _rot: number = 0
    private maxAimLength: number = 400

    constructor(x: number = 1, y: number = 1, radius: number = 20) {
        super("enemy")

        this.target = globalThis.player.pos

        this.indicator = new Graphic()
        this.indicator.lineStyle(5, 0x000000, 0.5)
        this.indicator.moveTo(0, 0)
        this.indicator.lineTo(0, -1)
        this.indicator.height = 0
        this.sprite = new Sprite(globalThis.spritesheet.textures["enemy.png"])
        this.collider = new Collider(this, radius)
        this.collider.on("exit", (col: Collider) => {
            if (col.gameObj.tag === "platform") {
                this.state = EnemyState.DEAD
            }
        })
        this.x = x
        this.y = y
        this.radius = radius
        this.state = EnemyState.AIM
        Enemy.enemies.push(this)
    }

    set x(x: number) {
        this._x = x
        this.sprite.x = x
        this.indicator.x = x
        this.collider.x = x
    }
    get x(): number {
        return this._x
    }

    set y(y: number) {
        this._y = y
        this.sprite.y = y
        this.indicator.y = y
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
                // Aim towards target
                const angleOfRot = Math.atan2(this.target.x - this.x, this.y - this.target.y)
                if (Math.abs(angleOfRot - this.rotation) < this.aimSpeed) {
                    angleAligned = true
                } else if (angleOfRot > this.rotation) {
                    this.rotation += this.aimSpeed
                } else {
                    this.rotation -= this.aimSpeed
                }
                // Pull back bow
                if (this.indicator.height < this.maxAimLength) {
                    this.indicator.height += 2
                }
                break
            }
            case EnemyState.KNOCK_BACK: {
                this.indicator.height = 0
                if (this.velocity.mag < 0.25) {
                    this.state = EnemyState.AIM
                }
                break
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
