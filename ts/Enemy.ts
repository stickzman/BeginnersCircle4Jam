/// <reference path="./GameObject.ts" />
enum EnemyState {
	DEAD,
	AIM,
	INACTIVE,
	KNOCK_BACK,
	DASH_KNOCK_BACK,
	DASH,
	REST,
	RECOVERY
}

class Enemy extends GameObject {
	static enemies: Enemy[] = []
	static combo = 1
	static comboSounds = [
		new Howl({
			src: ['./assets/audio/combo1.wav'],
			volume: 0.3
		}),
		new Howl({
			src: ['./assets/audio/combo2.wav'],
			volume: 0.3
		}),
		new Howl({
			src: ['./assets/audio/combo3.wav'],
			volume: 0.3
		}),
		new Howl({
			src: ['./assets/audio/combo4.wav'],
			volume: 0.3
		}),
		new Howl({
			src: ['./assets/audio/combo5.wav'],
			volume: 0.3
		}),
	]
	static hitSound = new Howl({
		src: ['./assets/audio/hit.wav'],
		volume: 0.25
	})
	static fallSound = new Howl({
		src: ['./assets/audio/enemyfall.wav'],
		volume: 0.5
	})
	static deathSound = new Howl({
		src: ['./assets/audio/score.wav'],
		volume: 0.5
	})


	sprite: PIXI.Sprite
	indicator: PIXI.Graphics

	collider: Collider
	velocity = new Vector(0, 0)
	friction: number = .9
	state: EnemyState
	pos = new Vector(1, 1)

	target: Vector

	combo: number = 1
	aimSpeed: number = 3
	chargeSpeed: number = 750
	dashMag: number = 30000
	dashSpeed: number = 750
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
					this.velocity.set(Vector.mult(collisionVector, -75))
				} else {
					this.velocity.set(Vector.mult(collisionVector, -e.velocity.mag))
					e.velocity.set(Vector.mult(collisionVector, 75))
				}

				if (this.state === EnemyState.DASH_KNOCK_BACK ||
					e.state === EnemyState.DASH_KNOCK_BACK
				) {
					this.state = EnemyState.DASH_KNOCK_BACK
					e.state = EnemyState.DASH_KNOCK_BACK
					globalThis.cam.shake = 0.25
					globalThis.frameHalt = 5
					Player.attackSound.play()
					if (faster) {
						this.combo = Enemy.combo
						e.combo = ++Enemy.combo
					} else {
						e.combo = Enemy.combo
						this.combo = ++Enemy.combo
					}
					const i = (Enemy.combo > Enemy.comboSounds.length)
						? Enemy.comboSounds.length - 1
						: Enemy.combo - 2
					Enemy.comboSounds[i].play()
					const points = 5 * Enemy.combo ** 2
					globalThis.score += points
					const pos = this.sprite.getGlobalPosition()
					flashScore(points, pos.x, pos.y - 50, 0x3083dc)
				} else {
					Enemy.hitSound.play()
					this.state = EnemyState.KNOCK_BACK
					e.state = EnemyState.KNOCK_BACK
				}

				col.touching.add(this.collider)
			}
		})
		this.radius = radius
		this.collider.on("exit", (col: Collider) => {
			if (col.gameObj.tag === "platform") {
				// 80% chance they 'catch' themselves before going over edge
				if (Math.random() < 0.8 && (this.state === EnemyState.DASH ||
					this.state === EnemyState.RECOVERY)
				) {
					this.velocity.normalize().mult(-375)
					this.state = EnemyState.KNOCK_BACK
				} else {
					this.radius = 20
					this.state = EnemyState.DEAD
					Enemy.fallSound.play()
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

	static update(deltaTime: DOMHighResTimeStamp) {
		for (const e of Enemy.enemies) {
			if (e.state === EnemyState.INACTIVE) {
				e.destroy()
				continue
			}
			e.update(deltaTime)
		}
	}

	update(deltaTime: DOMHighResTimeStamp) {
		switch (this.state) {
			case EnemyState.DEAD: {
				this.indicator.height = 0
				// Shrink enemy (like they're falling)
				this.radius -= 37.5 * deltaTime
				this.sprite.angle += 225 * deltaTime
				if (this.radius <= 0) {
					this.state = EnemyState.INACTIVE
					Enemy.deathSound.play()
					globalThis.score += 50 * this.combo ** 2
					const screenPos = this.sprite.getGlobalPosition()
					flashScore(50 * this.combo ** 2, screenPos.x, screenPos.y)
				}
				break
			}
			case EnemyState.AIM: {
				this.radius = 20
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

				if (Math.abs(diff) < this.aimSpeed * deltaTime) {
					angleAligned = true
				} else if (rotClockwise) {
					this.rotation += this.aimSpeed * deltaTime
				} else {
					this.rotation -= this.aimSpeed * deltaTime
				}
				// Pull back bow
				if (this.indicator.height < this.dashMag / 75 + 50) {
					this.indicator.height += this.chargeSpeed * deltaTime
				} else if (angleAligned &&
					globalThis.player.state !== PlayerState.KNOCK_BACK) {
					// Enter dash
					const v = Vector.fromVectors(this.pos, this.target)
					this.velocity.set(v.normalize()).mult(this.dashSpeed)
					this.dashEnd = Vector.add(this.pos, v.mult(this.dashMag))

					this.state = EnemyState.DASH
				}
				break
			}
			case EnemyState.DASH_KNOCK_BACK:
			case EnemyState.RECOVERY:
			case EnemyState.KNOCK_BACK: {
				this.indicator.height = 0
				if (this.velocity.mag < 18) {
					this.restStart = performance.now()
					this.restTime = Math.random() * 2000
					this.state = EnemyState.REST
				}
				break
			}
			case EnemyState.REST: {
				this.combo = 1
				if (performance.now() - this.restStart > this.restTime) {
					this.state = EnemyState.AIM
				}
				break
			}
			case EnemyState.DASH: {
				this.sprite.width = 30
				this.x += this.velocity.x * deltaTime
				this.y += this.velocity.y * deltaTime
				if (Vector.dist(this.pos, this.dashEnd) < this.dashSpeed * 2) {
					this.state = EnemyState.RECOVERY
				}
				break
			}
		}

		// Don't change sprite/do velocity if frameHalt, inactive, or dashing
		if (frameHalt > 0) return
		// Don't do velocity in a dash
		if (this.state == EnemyState.DASH || this.state === EnemyState.INACTIVE)
			return

		// Stretch sprite
		if (this.state !== EnemyState.DEAD) {
			this.sprite.width = 40 - (10 * (this.velocity.mag / this.dashSpeed))
		}

		// Update position
		this.x += this.velocity.x * deltaTime
		this.y += this.velocity.y * deltaTime

		// Update velocity
		this.velocity.x *= this.friction
		this.velocity.y *= this.friction
		if (Math.abs(this.velocity.x) < 7.5) this.velocity.x = 0
		if (Math.abs(this.velocity.y) < 7.5) this.velocity.y = 0
	}

	destroy() {
		this.sprite.destroy()
		this.indicator.destroy()
		this.collider.destroy()

		Enemy.enemies = Enemy.enemies.filter(e => {
			return e !== this
		})
	}

	static spawn(numEnemies: number, radius: number = 250, minRadius: number = 75) {
		for (let i = 0; i < numEnemies; i++) {
			let x: number, y: number, attempt = 0
			// Pick a random spot until you find an empty one, up to 100 tries
			do {
				attempt++
				const r = Math.floor((Math.random() * (radius - minRadius)) + minRadius)
				const angle = Math.random() * 360
				x = r * Math.sin(angle)
				y = r * Math.cos(angle)
			} while (Collider.circleCheck(x, y, 20, ["enemy", "player"]).length > 0
				&& attempt < 100)
			new Enemy(x, y)
		}
	}

	static clear() {
		for (const e of Enemy.enemies) {
			e.destroy()
		}
		Enemy.enemies = []
	}
}
