class Vector {
    private initialX: number
    private initialY: number

    constructor(public x: number, public y: number) {
        this.initialX = x
        this.initialY = y
    }

    reset(): Vector {
        this.x = this.initialX
        this.y = this.initialY
        return this
    }

    normalize(): Vector {
        this.div(this.mag)
        return this
    }

    mult(n: number): Vector {
        this.x *= n
        this.y *= n
        return this
    }

    div(n: number): Vector {
        this.x /= n
        this.y /= n
        return this
    }

    // Magnitude
    get mag(): number {
        return Math.sqrt(this.x**2 + this.y**2)
    }

    set(v: Vector) {
        this.x = v.x
        this.y = v.y
    }

    static fromPoints(x1: number, y1: number, x2: number, y2: number) {
        return new Vector(x2 - x1, y2 - y1)
    }
}
