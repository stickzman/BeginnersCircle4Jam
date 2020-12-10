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
class Vector {
    constructor(x = 0, y = 0) {
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
    set mag(m) {
        this.normalize().mult(m);
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
        return this;
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
    static fromAngle(a) {
        return new Vector(Math.cos(a), Math.sin(a));
    }
    static mult(v, n) {
        return v.copy().mult(n);
    }
    static div(v, n) {
        return v.copy().div(n);
    }
    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }
    static dist(v1, v2) {
        return Math.sqrt(Math.pow((v2.x - v1.x), 2) + Math.pow((v2.y - v1.y), 2));
    }
}
PIXI.settings.SORTABLE_CHILDREN = true;
class Camera {
    constructor(selector = "body", x = 0, y = 0) {
        this.maxShakeOffset = 20;
        this.shakeDecrease = 0.02;
        this.pos = new Vector(0, 0);
        this.renderer = PIXI.autoDetectRenderer();
        this.renderer.backgroundColor = 0x010203;
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
        this.pos.x = x;
        Camera.stage.x = this.width / 2 - x;
    }
    get x() {
        return this.pos.x;
    }
    set y(y) {
        this.pos.y = y;
        Camera.stage.y = this.height / 2 - y;
    }
    get y() {
        return this.pos.y;
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
        if (Camera.shake > 0) {
            const offsetX = this.maxShakeOffset * Math.pow(Camera.shake, 2) * (Math.random() * 2 - 1);
            const offsetY = this.maxShakeOffset * Math.pow(Camera.shake, 2) * (Math.random() * 2 - 1);
            Camera.stage.x = this.x + this.width / 2 - offsetX;
            Camera.stage.y = this.y + this.height / 2 - offsetY;
            Camera.shake -= this.shakeDecrease;
        }
        this.renderer.render(this.rotationLayer);
    }
}
Camera.shake = 0;
class Collider {
    constructor(gameObj, radius, x = 0, y = 0) {
        this.gameObj = gameObj;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.touching = new Set();
        this.listeners = [];
        if (gameObj !== null)
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
    destroy() {
        this.touching.forEach(c => {
            c.touching.delete(this);
        });
        this.touching.clear();
        this.listeners = [];
        if (this.visual)
            this.visual.destroy();
        Collider.allColliders = Collider.allColliders.filter(c => {
            return c !== this;
        });
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
                if (Collider.touching(col1, col2)) {
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
    static touching(col1, col2) {
        const dx = col1.x - col2.x;
        const dy = col1.y - col2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < col1.radius + col2.radius;
    }
    static circleCheck(x, y, radius, filter) {
        const results = [];
        const checkCol = new Collider(null, radius, x, y);
        for (const c of Collider.allColliders) {
            if (Collider.touching(checkCol, c)) {
                if (!filter || c.gameObj.tag === filter)
                    results.push(c);
            }
        }
        return results;
    }
}
Collider.allColliders = [];
Collider.debug = false;
class GameObject {
    constructor(tag = "") {
        this.tag = tag;
    }
}
var EnemyState;
(function (EnemyState) {
    EnemyState[EnemyState["DEAD"] = 0] = "DEAD";
    EnemyState[EnemyState["AIM"] = 1] = "AIM";
    EnemyState[EnemyState["INACTIVE"] = 2] = "INACTIVE";
    EnemyState[EnemyState["KNOCK_BACK"] = 3] = "KNOCK_BACK";
    EnemyState[EnemyState["DASH_KNOCK_BACK"] = 4] = "DASH_KNOCK_BACK";
    EnemyState[EnemyState["DASH"] = 5] = "DASH";
    EnemyState[EnemyState["REST"] = 6] = "REST";
    EnemyState[EnemyState["RECOVERY"] = 7] = "RECOVERY";
})(EnemyState || (EnemyState = {}));
class Enemy extends GameObject {
    constructor(x = 1, y = 1, radius = 20) {
        super("enemy");
        this.velocity = new Vector(0, 0);
        this.friction = .9;
        this.pos = new Vector(1, 1);
        this.aimSpeed = 0.05;
        this.chargeSpeed = 10;
        this.dashMag = 400;
        this.dashSpeed = 10;
        this.restTime = 0;
        this.restStart = 0;
        this._r = 0;
        this._rot = 0;
        this.target = globalThis.player.pos;
        this.indicator = new Graphic();
        this.indicator.lineStyle(5, 0xec1c24, 0.5);
        this.indicator.moveTo(0, 0);
        this.indicator.lineTo(0, -1);
        this.indicator.height = 0;
        this.sprite = new Sprite(globalThis.spritesheet.textures["enemy.png"]);
        this.collider = new Collider(this, radius);
        this.collider.on("enter", (col) => {
            if (col.gameObj.tag === "enemy") {
                const e = col.gameObj;
                if (e.state === EnemyState.DEAD || e.state === EnemyState.INACTIVE)
                    return;
                const collisionVector = Vector.fromPoints(this.collider.x, this.collider.y, col.x, col.y).normalize();
                const faster = this.velocity.mag >= e.velocity.mag;
                if (faster) {
                    e.velocity.set(Vector.mult(collisionVector, this.velocity.mag));
                    this.velocity.set(Vector.mult(collisionVector, -1));
                }
                else {
                    this.velocity.set(Vector.mult(collisionVector, -e.velocity.mag));
                    e.velocity.set(Vector.mult(collisionVector, 1));
                }
                if (this.state === EnemyState.DASH_KNOCK_BACK ||
                    e.state === EnemyState.DASH_KNOCK_BACK) {
                    this.state = EnemyState.DASH_KNOCK_BACK;
                    e.state = EnemyState.DASH_KNOCK_BACK;
                    Camera.shake = 0.25;
                    globalThis.frameHalt = 5;
                    Player.attackSound.play();
                    Enemy.combo++;
                    const i = (Enemy.combo >= Enemy.comboSounds.length)
                        ? Enemy.comboSounds.length - 1
                        : Enemy.combo;
                    Enemy.comboSounds[i].play();
                }
                else {
                    Enemy.hitSound.play();
                    this.state = EnemyState.KNOCK_BACK;
                    e.state = EnemyState.KNOCK_BACK;
                }
                col.touching.add(this.collider);
            }
        });
        this.radius = radius;
        this.collider.on("exit", (col) => {
            if (col.gameObj.tag === "platform") {
                if (Math.random() < 0.6 && (this.state === EnemyState.DASH ||
                    this.state === EnemyState.RECOVERY)) {
                    this.velocity.normalize().mult(-5);
                    this.state = EnemyState.KNOCK_BACK;
                }
                else {
                    this.radius = 20;
                    this.state = EnemyState.DEAD;
                    Enemy.fallSound.play();
                }
            }
        });
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.state = EnemyState.KNOCK_BACK;
        Enemy.enemies.push(this);
    }
    set x(x) {
        this.pos.x = x;
        this.sprite.x = x;
        this.indicator.x = x;
        this.collider.x = x;
    }
    get x() {
        return this.pos.x;
    }
    set y(y) {
        this.pos.y = y;
        this.sprite.y = y;
        this.indicator.y = y;
        this.collider.y = y;
    }
    get y() {
        return this.pos.y;
    }
    set radius(r) {
        this._r = r;
        this.sprite.width = this.sprite.height = r * 2;
        this.collider.radius = r;
    }
    get radius() {
        return this._r;
    }
    set rotation(r) {
        this._rot = r;
        this.sprite.rotation = r;
        this.indicator.rotation = r;
    }
    get rotation() {
        return this._rot;
    }
    update() {
        switch (this.state) {
            case EnemyState.DEAD: {
                this.indicator.height = 0;
                this.radius -= 0.5;
                this.sprite.angle += 3;
                if (this.radius <= 0) {
                    this.state = EnemyState.INACTIVE;
                    Enemy.deathSound.play();
                }
                break;
            }
            case EnemyState.AIM: {
                this.radius = 20;
                let angleAligned = false;
                let rotClockwise;
                const angleOfRot = Math.atan2(this.target.x - this.x, this.y - this.target.y) + Math.PI;
                const currRot = this.rotation + Math.PI;
                const diff = (currRot - angleOfRot) % (2 * Math.PI);
                if (currRot > Math.PI) {
                    rotClockwise = (diff > Math.PI || diff < 0);
                }
                else {
                    rotClockwise = (diff < 0 && diff < Math.PI);
                }
                if (Math.abs(diff) < this.aimSpeed) {
                    angleAligned = true;
                }
                else if (rotClockwise) {
                    this.rotation += this.aimSpeed;
                }
                else {
                    this.rotation -= this.aimSpeed;
                }
                if (this.indicator.height < this.dashMag + 50) {
                    this.indicator.height += this.chargeSpeed;
                }
                else if (angleAligned) {
                    const v = Vector.fromVectors(this.pos, this.target);
                    this.velocity.set(v.normalize()).mult(this.dashSpeed);
                    this.dashEnd = Vector.add(this.pos, v.mult(this.dashMag));
                    this.state = EnemyState.DASH;
                }
                break;
            }
            case EnemyState.DASH_KNOCK_BACK:
            case EnemyState.RECOVERY:
            case EnemyState.KNOCK_BACK: {
                this.indicator.height = 0;
                if (this.velocity.mag < 0.25) {
                    this.restStart = performance.now();
                    this.restTime = Math.random() * 2000;
                    this.state = EnemyState.REST;
                }
                break;
            }
            case EnemyState.REST: {
                if (performance.now() - this.restStart > this.restTime) {
                    this.state = EnemyState.AIM;
                }
                break;
            }
            case EnemyState.DASH: {
                this.sprite.width = 30;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                if (Vector.dist(this.pos, this.dashEnd) < this.dashSpeed * 2) {
                    this.state = EnemyState.RECOVERY;
                }
                break;
            }
        }
        if (frameHalt > 0)
            return;
        if (this.state == EnemyState.DASH || this.state === EnemyState.INACTIVE)
            return;
        if (this.state !== EnemyState.DEAD) {
            this.sprite.width = 40 - (10 * (this.velocity.mag / this.dashSpeed));
        }
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        if (Math.abs(this.velocity.x) < 0.1)
            this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.1)
            this.velocity.y = 0;
    }
    destroy() {
        this.sprite.destroy();
        this.indicator.destroy();
        this.collider.destroy();
    }
    static spawn(numEnemies, radius = 250, minRadius = 75) {
        for (let i = 0; i < numEnemies; i++) {
            let r = Math.floor((Math.random() * (radius - minRadius)) + minRadius);
            let angle = Math.random() * 360;
            let x = r * Math.sin(angle);
            let y = r * Math.cos(angle);
            new Enemy(x, y);
        }
    }
    static clear() {
        for (const e of Enemy.enemies) {
            e.destroy();
        }
        Enemy.enemies = [];
    }
}
Enemy.enemies = [];
Enemy.combo = 0;
Enemy.comboSounds = [
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
];
Enemy.hitSound = new Howl({
    src: ['./assets/audio/hit.wav'],
    volume: 0.25
});
Enemy.fallSound = new Howl({
    src: ['./assets/audio/enemyfall.wav'],
    volume: 0.5
});
Enemy.deathSound = new Howl({
    src: ['./assets/audio/score.wav'],
    volume: 0.5
});
class Graphic extends PIXI.Graphics {
    constructor() {
        super();
        Camera.stage.addChild(this);
    }
}
var Howl;
let cam = new Camera();
var player;
let platform;
PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init);
function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet;
    globalThis.spritesheet = sheet;
    platform = new Platform();
    player = new Player();
    new Enemy(50, 0);
    new Enemy(100, 0);
    new Enemy(150, 0);
    new Enemy(200, 0);
    new Enemy(250, 0);
    window.requestAnimationFrame(tick);
}
function reset() {
    Enemy.clear();
    player.respawn();
}
var frameID;
var frameHalt = 0;
function tick() {
    if (frameHalt > 0) {
        --frameHalt;
        frameID = window.requestAnimationFrame(tick);
        cam.render();
        return;
    }
    Collider.update();
    player.update();
    for (const [i, e] of Enemy.enemies.entries()) {
        if (e.state === EnemyState.INACTIVE) {
            Enemy.enemies.splice(i, 1);
            continue;
        }
        e.update();
    }
    if (Enemy.enemies.length === 0)
        console.log("YOU WIN!");
    cam.render();
    frameID = window.requestAnimationFrame(tick);
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
        this.graphic = new Graphic();
        this.graphic.beginFill(0xFFFFFF);
        this.graphic.drawCircle(0, 0, cam.height / 2 - 10);
        this.graphic.endFill();
        this.collider = new Collider(this, cam.height / 2 - 12);
    }
    reInitialize() {
        Camera.stage.addChild(this.graphic);
        Collider.allColliders.push(this.collider);
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
    constructor(radius = 15) {
        super("player");
        this.speed = 3;
        this.state = PlayerState.MOVE;
        this.pos = new Vector(0, 0);
        this.velocity = new Vector(0, 0);
        this.friction = .9;
        this.knockBackMag = 20;
        this.maxDashMag = 40;
        this.maxAimTime = 500;
        this.indicator = new Sprite(globalThis.spritesheet.textures["arrow.png"]);
        this.sprite = new Sprite(globalThis.spritesheet.textures["player.png"]);
        this.sprite.zIndex = 1;
        this.collider = new Collider(this, radius);
        this.indicator.pivot.set(this.indicator.width / 2, this.indicator.height + 10);
        this.indicator.width = 25;
        this.indicator.height = 0;
        this.collider.on("exit", (col) => {
            if (col.gameObj.tag === "platform") {
                this.state = PlayerState.DEAD;
                this.initialRadius = this.radius;
                Player.fallSound.play();
                console.log("YOU DIED");
            }
        });
        this.collider.on("enter", (col) => {
            if (this.state === PlayerState.DEAD)
                return;
            if (col.gameObj.tag === "enemy") {
                const e = col.gameObj;
                if (e.state === EnemyState.DEAD || e.state === EnemyState.INACTIVE)
                    return;
                e.state = EnemyState.KNOCK_BACK;
                const collisionVector = Vector.fromPoints(this.collider.x, this.collider.y, col.x, col.y).normalize();
                const faster = this.velocity.mag > e.velocity.mag;
                if (faster) {
                    if (this.state === PlayerState.DASH) {
                        Enemy.combo = 0;
                        e.sprite.angle = this.sprite.angle;
                        Camera.shake = .5 * (this.velocity.mag / this.maxDashMag + 0.1);
                        globalThis.frameHalt = 5;
                        e.velocity.set(Vector.mult(collisionVector, this.velocity.mag));
                        Player.attackSound.play();
                        e.state = EnemyState.DASH_KNOCK_BACK;
                    }
                    else {
                        Player.smallHitSound.play();
                    }
                    this.velocity.set(Vector.mult(collisionVector, -1));
                }
                else {
                    Camera.shake = 0.35;
                    globalThis.frameHalt = 5;
                    this.velocity.set(Vector.mult(collisionVector, -this.knockBackMag));
                    e.velocity.set(Vector.mult(collisionVector, 1));
                    Player.hitSound.play();
                }
                this.state = PlayerState.KNOCK_BACK;
            }
        });
        this.radius = radius;
        this.initialRadius = radius;
    }
    set x(x) {
        this.pos.x = x;
        this.sprite.x = x;
        this.indicator.x = x;
        this.collider.x = x;
    }
    get x() {
        return this.pos.x;
    }
    set y(y) {
        this.pos.y = y;
        this.sprite.y = y;
        this.indicator.y = y;
        this.collider.y = y;
    }
    get y() {
        return this.pos.y;
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
                this.sprite.angle += 6;
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
                break;
            }
            case PlayerState.KNOCK_BACK: {
                this.indicator.height = 0;
                if (this.velocity.mag < 0.5) {
                    this.state = PlayerState.MOVE;
                }
                break;
            }
        }
        if (frameHalt > 0)
            return;
        if (this.state !== PlayerState.DEAD)
            this.sprite.width = this.radius * 2 - ((this.radius + 5) * (this.velocity.mag / this.maxDashMag));
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
        const enemiesAtSpawn = Collider.circleCheck(0, 0, this.initialRadius, "enemy");
        for (const c of enemiesAtSpawn) {
            const e = c.gameObj;
            const dir = Vector.fromPoints(0, 0, c.x, c.y);
            dir.mag = 25;
            e.pos.set(dir.mag);
        }
        this.state = PlayerState.MOVE;
        this.x = 0;
        this.y = 0;
        this.velocity.set(0, 0);
        this.radius = this.initialRadius;
    }
    reInitialize() {
        Camera.stage.addChild(this.indicator);
        Camera.stage.addChild(this.sprite);
        Collider.allColliders.push(this.collider);
    }
}
Player.hitSound = new Howl({
    src: ['./assets/audio/hit.wav']
});
Player.fallSound = new Howl({
    src: ['./assets/audio/fall.wav'],
    volume: 0.5
});
Player.attackSound = new Howl({
    src: ['./assets/audio/attack.wav'],
    volume: 0.5
});
Player.smallHitSound = new Howl({
    src: ['./assets/audio/smallhit.wav'],
    volume: 0.25
});
//# sourceMappingURL=index.js.map