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
    constructor(texture) {
        super(texture);
        this.pivot.set(this.width / 2, this.height / 2);
        Camera.stage.addChild(this);
    }
}
class Camera {
    constructor(selector = "body", x = 0, y = 0) {
        this.renderer = PIXI.autoDetectRenderer();
        this.renderer.backgroundColor = 0x000000000;
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
Collider.debug = true;
const cam = new Camera();
const stage = Camera.stage;
PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init);
let player;
function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet;
    new Platform();
    player = new Player(sheet.textures["player.png"]);
    player.collider.on("exit", col => {
        if (col.gameObj.tag === "platform")
            console.log("YOU DIED");
    });
    window.requestAnimationFrame(tick);
}
let frameCount = 0;
function tick() {
    ++frameCount;
    Collider.update();
    player.update();
    cam.render();
    window.requestAnimationFrame(tick);
}
var UP, DOWN, LEFT, RIGHT;
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
document.querySelector("canvas").addEventListener("mousemove", e => {
    globalThis.mouseX = e.offsetX;
    globalThis.mouseY = e.offsetY;
});
class GameObject {
    constructor(tag = "") {
        this.tag = tag;
    }
}
class Player extends GameObject {
    constructor(img) {
        super("player");
        this.speed = 5;
        this.dead = false;
        this._x = 0;
        this._y = 0;
        this.sprite = new Sprite(img);
        this.collider = new Collider(this, 45);
        this.collider.on("exit", (col) => {
            if (col.gameObj.tag === "platform")
                this.dead = true;
        });
    }
    set x(x) {
        this._x = x;
        this.sprite.x = x;
        this.collider.x = x;
    }
    get x() {
        return this._x;
    }
    set y(y) {
        this._y = y;
        this.sprite.y = y;
        this.collider.y = y;
    }
    get y() {
        return this._y;
    }
    lookAt(x, y) {
        const p = this.sprite.getGlobalPosition();
        const rotation = Math.atan2(x - p.x, p.y - y);
        this.sprite.rotation = rotation;
    }
    update() {
        if (this.dead) {
            this.sprite.scale.set(this.sprite.scale.x - 0.01);
            if (this.sprite.scale.x <= 0) {
                this.respawn();
            }
            return;
        }
        if (globalThis.UP)
            player.y -= player.speed;
        if (globalThis.DOWN)
            player.y += player.speed;
        if (globalThis.LEFT)
            player.x -= player.speed;
        if (globalThis.RIGHT)
            player.x += player.speed;
        player.lookAt(globalThis.mouseX, globalThis.mouseY);
    }
    respawn() {
        this.dead = false;
        this.x = 0;
        this.y = 0;
        this.sprite.scale.set(1);
    }
}
class Platform extends GameObject {
    constructor() {
        super("platform");
        const graphic = new PIXI.Graphics();
        graphic.lineStyle(2, 0x000000000);
        graphic.beginFill(0xFFFFFF);
        graphic.drawCircle(0, 0, cam.height / 2 - 10);
        graphic.endFill();
        Camera.stage.addChild(graphic);
        new Collider(this, cam.height / 2 - 20);
    }
}
//# sourceMappingURL=index.js.map