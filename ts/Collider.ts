interface Listener {
    eventType: string,
    callback: Function
}

class Collider {
    static allColliders: Collider[] = []
    static debug: boolean = false
    touching: Set<Collider> = new Set()
    listeners: Listener[] = []
    visual: PIXI.Graphics

    constructor(public gameObj: GameObject | null, public radius: number, public x = 0, public y = 0) {
        if (gameObj !== null) Collider.allColliders.push(this)
        if (Collider.debug) {
            this.visual = new PIXI.Graphics()
            this.visual.lineStyle(2, 0x00FF00)
            this.visual.beginFill(0xFFFFFF, 0)
            this.visual.drawCircle(0, 0, radius)
            this.visual.endFill()
            this.visual.x = x
            this.visual.y = y
            globalThis.cam.stage.addChild(this.visual)
        }
    }

    on(event: string, callback: Function) {
        this.listeners.push({eventType: event, callback: callback})
    }

    destroy() {
        this.touching.forEach(c => {
            c.touching.delete(this)
        })
        this.touching.clear()
        this.listeners = []
        if (this.visual) this.visual.destroy()

        Collider.allColliders = Collider.allColliders.filter(c => {
            return c !== this
        })
    }

    static update() {
        for (const col1 of Collider.allColliders) {

            // Update visual coordinates
            if (Collider.debug) {
                col1.visual.x = col1.x
                col1.visual.y = col1.y
                col1.visual.width = col1.visual.height = col1.radius * 2
            }

            for (const col2 of Collider.allColliders) {
                if (col1 === col2) continue

                if (Collider.touching(col1, col2)) {
                    // Collision detected!
                    if (col1.touching.has(col2)) continue
                    col1.touching.add(col2)
                    // Alert listeners of collision enter
                    for (const l of col1.listeners) {
                        if (l.eventType !== "enter") continue
                        l.callback(col2)
                    }
                } else {
                    // No collision
                    if (!col1.touching.delete(col2)) continue
                    // Alert listeners of collision exit
                    for (const l of col1.listeners) {
                        if (l.eventType !== "exit") continue
                        l.callback(col2)
                    }
                }
            }
        }
    }

    static touching(col1: Collider, col2: Collider): boolean {
        // Find distance between the circles centers
        const dx = col1.x - col2.x
        const dy = col1.y - col2.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < col1.radius + col2.radius
    }

    static circleCheck(x: number, y: number, radius: number, filter: string): Collider[] {
        const results = []
        const checkCol = new Collider(null, radius, x, y)
        for (const c of Collider.allColliders) {
            if (Collider.touching(checkCol, c)) {
                if (!filter || c.gameObj.tag === filter) results.push(c)
            }
        }
        return results
    }
}
