class AnimatedSprite {
    constructor(stage, animName, animation, interval, offset = 0) {
        this.animations = [];
        this.sprite = new PIXI.AnimatedSprite(animation, false);
        this.addAnimation(animName, animation, interval, offset);
        this.playAnimation(animName);
        stage.addChild(this.sprite);
    }
    set x(x) {
        this.sprite.x = x;
    }
    set y(y) {
        this.sprite.y = y;
    }
    get x() {
        return this.sprite.x;
    }
    get y() {
        return this.sprite.y;
    }
    addAnimation(animName, animation, interval, offset = 0) {
        this.animations[animName] = new Anim(animation, interval, offset);
    }
    playAnimation(name) {
        const anim = this.animations[name];
        this.sprite.textures = anim.animation;
        this.interval = anim.interval;
        this.offset = anim.offset;
        this.sprite.gotoAndStop(0);
    }
    update(frame) {
        if ((frame - this.offset) % this.interval === 0) {
            this.sprite.gotoAndStop(this.sprite.currentFrame + 1);
        }
    }
}
class Anim {
    constructor(animation, interval, offset = 0) {
        this.animation = animation;
        this.interval = interval;
        this.offset = offset;
    }
}
class Sprite extends PIXI.Sprite {
    constructor(texture, width, height) {
        super(texture);
        if (width !== undefined) {
            if (height === undefined)
                height = width;
            this.width = width;
            this.height = height;
        }
        this.pivot.set(this.width / 2, this.height / 2);
        Camera.stage.addChild(this);
    }
}
class Camera {
    constructor(selector = "body", x = 0, y = 0) {
        this.renderer = PIXI.autoDetectRenderer();
        this.renderer.backgroundColor = 0x000000;
        document.querySelector(selector).appendChild(this.renderer.view);
        this.width = this.renderer.width;
        this.height = this.renderer.height;
        Camera.stage = new PIXI.Container();
        this.rotationLayer = new PIXI.Container();
        this.rotationLayer.addChild(Camera.stage);
        this.rotationLayer.pivot.set(this.renderer.width / 2, this.renderer.height / 2);
        this.rotationLayer.x = this.renderer.width / 2;
        this.rotationLayer.y = this.renderer.height / 2;
        this.x = x;
        this.y = y;
    }
    set x(x) {
        Camera.stage.x = this.width / 2 - x;
    }
    get x() {
        return this.width / 2 - Camera.stage.x;
    }
    set y(y) {
        Camera.stage.y = this.height / 2 - y;
    }
    get y() {
        return this.height / 2 - Camera.stage.y;
    }
    set angle(a) {
        this.rotationLayer.angle = a;
    }
    get angle() {
        return this.rotationLayer.angle;
    }
    target(container) {
        this.x = container.x;
        this.y = container.y;
    }
    render() {
        this.renderer.render(this.rotationLayer);
    }
}
class Collider {
    constructor(gameObj, radius, x = 0, y = 0) {
        this.gameObj = gameObj;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.touching = new Set();
        this.listeners = [];
        Collider.allColliders.push(this);
        if (Collider.debug) {
            this.visual = new PIXI.Graphics();
            this.visual.lineStyle(2, 0x00FF00);
            this.visual.beginFill(0xFFFFFF, 0);
            this.visual.drawCircle(0, 0, radius);
            this.visual.endFill();
            this.visual.x = x;
            this.visual.y = y;
            Camera.stage.addChild(this.visual);
        }
    }
    on(event, callback) {
        this.listeners.push({ eventType: event, callback: callback });
    }
    static update() {
        for (const col1 of Collider.allColliders) {
            if (Collider.debug) {
                col1.visual.x = col1.x;
                col1.visual.y = col1.y;
                col1.visual.width = col1.visual.height = col1.radius * 2;
            }
            for (const col2 of Collider.allColliders) {
                if (col1 === col2)
                    continue;
                const dx = col1.x - col2.x;
                const dy = col1.y - col2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < col1.radius + col2.radius) {
                    if (col1.touching.has(col2))
                        continue;
                    col1.touching.add(col2);
                    for (const l of col1.listeners) {
                        if (l.eventType !== "enter")
                            continue;
                        l.callback(col2);
                    }
                }
                else {
                    if (!col1.touching.delete(col2))
                        continue;
                    for (const l of col1.listeners) {
                        if (l.eventType !== "exit")
                            continue;
                        l.callback(col2);
                    }
                }
            }
        }
    }
}
Collider.allColliders = [];
Collider.debug = false;
class GameObject {
    constructor(tag = "") {
        this.tag = tag;
    }
}
class Enemy extends GameObject {
    constructor(x = 0, y = 0, radius = 20) {
        super("enemy");
        this.radius = radius;
        this.velocity = new Vector(0, 0);
        this.friction = .9;
        this._x = 0;
        this._y = 0;
        this.collider = new Collider(this, radius);
        this.x = x;
        this.y = y;
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        if (Math.abs(this.velocity.x) < 0.1)
            this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.1)
            this.velocity.y = 0;
    }
    set x(x) {
        this._x = x;
        this.collider.x = x;
    }
    get x() {
        return this._x;
    }
    set y(y) {
        this._y = y;
        this.collider.y = y;
    }
    get y() {
        return this._y;
    }
}
const cam = new Camera();
const stage = Camera.stage;
PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init);
let player, enemy;
let lastTimestamp;
function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet;
    globalThis.spritesheet = sheet;
    new Platform();
    enemy = new Enemy(100, 100);
    player = new Player(sheet.textures["player.png"]);
    player.collider.on("exit", col => {
        if (col.gameObj.tag === "platform")
            console.log("YOU DIED");
    });
    lastTimestamp = performance.now();
    window.requestAnimationFrame(tick);
}
var deltaTime;
function tick(time) {
    deltaTime = time - lastTimestamp;
    Collider.update();
    player.update();
    enemy.update();
    cam.render();
    lastTimestamp = time;
    window.requestAnimationFrame(tick);
}
var UP, DOWN, LEFT, RIGHT, LEFT_MOUSE, RIGHT_MOUSE;
var mouseX = 0;
var mouseY = 0;
window.addEventListener("keydown", e => {
    switch (e.key.toLowerCase()) {
        case "w":
            globalThis.UP = true;
            break;
        case "a":
            globalThis.LEFT = true;
            break;
        case "s":
            globalThis.DOWN = true;
            break;
        case "d":
            globalThis.RIGHT = true;
            break;
    }
});
window.addEventListener("keyup", e => {
    switch (e.key.toLowerCase()) {
        case "w":
            globalThis.UP = false;
            break;
        case "a":
            globalThis.LEFT = false;
            break;
        case "s":
            globalThis.DOWN = false;
            break;
        case "d":
            globalThis.RIGHT = false;
            break;
    }
});
window.addEventListener("mousemove", e => {
    globalThis.mouseX = e.clientX;
    globalThis.mouseY = e.clientY;
});
window.addEventListener("mousedown", e => {
    if (e.which === 1)
        globalThis.LEFT_MOUSE = true;
    if (e.which === 3)
        globalThis.RIGHT_MOUSE = true;
});
window.addEventListener("mouseup", e => {
    if (e.which === 1)
        globalThis.LEFT_MOUSE = false;
    if (e.which === 3)
        globalThis.RIGHT_MOUSE = false;
});
document.querySelector("canvas").addEventListener("contextmenu", e => {
    e.preventDefault();
});
class Platform extends GameObject {
    constructor() {
        super("platform");
        const graphic = new PIXI.Graphics();
        graphic.lineStyle(2, 0x000000000);
        graphic.beginFill(0xFFFFFF);
        graphic.drawCircle(0, 0, cam.height / 2 - 10);
        graphic.endFill();
        Camera.stage.addChild(graphic);
        new Collider(this, cam.height / 2 - 12);
    }
}
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["DEAD"] = 0] = "DEAD";
    PlayerState[PlayerState["MOVE"] = 1] = "MOVE";
    PlayerState[PlayerState["AIM"] = 2] = "AIM";
    PlayerState[PlayerState["DASH"] = 3] = "DASH";
    PlayerState[PlayerState["KNOCK_BACK"] = 4] = "KNOCK_BACK";
})(PlayerState || (PlayerState = {}));
class Player extends GameObject {
    constructor(img, radius = 15) {
        super("player");
        this.speed = 3;
        this.state = PlayerState.MOVE;
        this.velocity = new Vector(0, 0);
        this.friction = .9;
        this.maxDashMag = 30;
        this.maxAimTime = 900;
        this._x = 0;
        this._y = 0;
        this.indicator = new Sprite(globalThis.spritesheet.textures["arrow.png"]);
        this.sprite = new Sprite(img);
        this.collider = new Collider(this, radius);
        this.indicator.pivot.set(this.indicator.width / 2, this.indicator.height + 10);
        this.indicator.width = 25;
        this.indicator.height = 0;
        this.collider.on("exit", (col) => {
            if (col.gameObj.tag === "platform") {
                this.state = PlayerState.DEAD;
                this.initialRadius = this.radius;
            }
        });
        this.collider.on("enter", (col) => {
            if (col.gameObj.tag === "enemy") {
                const e = col.gameObj;
                const collisionVector = Vector.fromPoints(this.collider.x, this.collider.y, col.x, col.y).normalize();
                const vel = this.velocity.mag;
                this.velocity.set(Vector.mult(collisionVector, -vel / 2));
                e.velocity.set(collisionVector.mult(vel));
                this.state = PlayerState.KNOCK_BACK;
            }
        });
        this.radius = radius;
        this.initialRadius = radius;
    }
    set x(x) {
        this._x = x;
        this.sprite.x = x;
        this.indicator.x = x;
        this.collider.x = x;
    }
    get x() {
        return this._x;
    }
    set y(y) {
        this._y = y;
        this.sprite.y = y;
        this.indicator.y = y;
        this.collider.y = y;
    }
    get y() {
        return this._y;
    }
    set radius(r) {
        this._r = r;
        this.sprite.width = this.sprite.height = r * 2;
        this.collider.radius = r;
    }
    get radius() {
        return this._r;
    }
    get screenPos() {
        return this.sprite.getGlobalPosition();
    }
    lookAt(x, y) {
        const p = this.screenPos;
        const rotation = Math.atan2(x - p.x, p.y - y);
        this.sprite.rotation = rotation;
        this.indicator.rotation = rotation;
    }
    update() {
        switch (this.state) {
            case PlayerState.DEAD: {
                this.radius -= 0.5;
                this.sprite.angle += 3;
                if (this.radius <= 0) {
                    this.respawn();
                }
                break;
            }
            case PlayerState.MOVE: {
                if (globalThis.UP) {
                    this.velocity.y = -player.speed;
                }
                else if (globalThis.DOWN) {
                    this.velocity.y = player.speed;
                }
                if (globalThis.LEFT) {
                    this.velocity.x = -player.speed;
                }
                else if (globalThis.RIGHT) {
                    this.velocity.x = player.speed;
                }
                if (globalThis.LEFT_MOUSE) {
                    this.state = PlayerState.AIM;
                    this.startAimTime = performance.now();
                }
                break;
            }
            case PlayerState.AIM: {
                const aimTime = performance.now() - this.startAimTime;
                const percent = Math.min(1, Math.sqrt(aimTime / this.maxAimTime));
                this.indicator.height = 100 * percent;
                if (!globalThis.LEFT_MOUSE) {
                    const dashMag = this.maxDashMag * percent;
                    this.indicator.height = 0;
                    console.log(percent, dashMag);
                    const p = this.screenPos;
                    const v = Vector.fromPoints(p.x, p.y, globalThis.mouseX, globalThis.mouseY);
                    this.velocity.set(v.normalize().mult(dashMag));
                    this.state = PlayerState.DASH;
                }
                break;
            }
            case PlayerState.DASH: {
                if (globalThis.LEFT_MOUSE) {
                    this.state = PlayerState.AIM;
                    this.startAimTime = performance.now();
                }
                else if (this.velocity.mag < this.speed / 2) {
                    this.state = PlayerState.MOVE;
                }
            }
            case PlayerState.KNOCK_BACK: {
                if (this.velocity.mag < 1) {
                    this.state = PlayerState.MOVE;
                }
            }
        }
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        if (Math.abs(this.velocity.x) < 0.1)
            this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.1)
            this.velocity.y = 0;
        if (this.state !== PlayerState.DEAD)
            player.lookAt(globalThis.mouseX, globalThis.mouseY);
    }
    respawn() {
        this.state = PlayerState.MOVE;
        this.x = 0;
        this.y = 0;
        this.velocity.set(0, 0);
        this.radius = this.initialRadius;
    }
}
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    normalize() {
        this.div(this.mag);
        return this;
    }
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }
    div(n) {
        this.x /= n;
        this.y /= n;
        return this;
    }
    get mag() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    set(v, y) {
        if (v instanceof Vector) {
            this.x = v.x;
            this.y = v.y;
        }
        else if (y === undefined) {
            this.x = this.y = v;
        }
        else {
            this.x = v;
            this.y = y;
        }
    }
    copy() {
        return new Vector(this.x, this.y);
    }
    static fromPoints(x1, y1, x2, y2) {
        return new Vector(x2 - x1, y2 - y1);
    }
    static fromVectors(v1, v2) {
        return Vector.fromPoints(v1.x, v1.y, v2.x, v2.y);
    }
    static mult(v, n) {
        return v.copy().mult(n);
    }
    static div(v, n) {
        return v.copy().div(n);
    }
}
//# sourceMappingURL=index.js.map