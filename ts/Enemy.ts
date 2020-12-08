/// <reference path="./GameObject.ts" />
enum EnemyState {
    DEAD,
    MOVE,
    INACTIVE
}

class Enemy extends GameObject {
    static enemies: Enemy[] = []
    sprite: PIXI.Sprite
    collider: Collider
    velocity = new Vector(0, 0)
    friction: number = .9
    state: EnemyState

    private _x: number = 0
    private _y: number = 0
    private _r: number = 0
    private initialRadius: number

    constructor(x: number = 0, y: number = 0, radius: number = 20) {
        super("enemy")
        this.sprite = new Sprite(globalThis.spritesheet.textures["enemy.png"])
        this.collider = new Collider(this, radius)
        this.collider.on("exit", (col: Collider) => {
            if (col.gameObj.tag === "platform") {
                this.state = EnemyState.DEAD
                this.initialRadius = this.radius
            }
        })
        this.x = x
        this.y = y
        this.radius = radius
        this.state = EnemyState.MOVE
        Enemy.enemies.push(this)
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
