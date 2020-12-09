class Vector {
    constructor(public x: number, public y: number) { }

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

    set mag(m: number) {
        this.normalize().mult(m)
    }

    set(v: Vector | number, y?: number) {
        if (v instanceof Vector) {
            this.x = v.x
            this.y = v.y
        } else if (y === undefined) {
            this.x = this.y = v
        } else {
            this.x = v
            this.y = y
        }
    }

    copy(): Vector {
        return new Vector(this.x, this.y)
    }

    static fromPoints(x1: number, y1: number, x2: number, y2: number) {
        return new Vector(x2 - x1, y2 - y1)
    }

    static fromVectors(v1: Vector, v2: Vector) {
        return Vector.fromPoints(v1.x, v1.y, v2.x, v2.y)
    }

    // Unit vector from given angle (in radians)
    static fromAngle(a: number) {
        return new Vector(Math.cos(a), Math.sin(a))
    }

    // Multiply without changing original vector
    static mult(v: Vector, n: number) {
        return v.copy().mult(n)
    }

    // Divide without changing original vector
    static div(v: Vector, n: number) {
        return v.copy().div(n)
    }

    static add(v1: Vector, v2: Vector) {
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }

    static dist(v1: Vector, v2: Vector) {
        return Math.sqrt((v2.x - v1.x)**2 + (v2.y - v1.y)**2)
    }
}
