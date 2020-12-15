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
        globalThis.cam.stage.addChild(this);
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
        return Math.sqrt(this.x ** 2 + this.y ** 2);
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
        return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
    }
}
PIXI.settings.SORTABLE_CHILDREN = true;
class Camera {
    constructor(selector = "body", x = 0, y = 0) {
        this.shake = 0;
        this.maxShakeOffset = 20;
        this.shakeDecrease = 0.02;
        this.pos = new Vector(0, 0);
        this.renderer = PIXI.autoDetectRenderer();
        this.renderer.backgroundColor = 0x010203;
        document.querySelector(selector).appendChild(this.renderer.view);
        this.width = this.renderer.width;
        this.height = this.renderer.height;
        this.stage = new PIXI.Container();
        this.rotationLayer = new PIXI.Container();
        this.rotationLayer.addChild(this.stage);
        this.rotationLayer.pivot.set(this.renderer.width / 2, this.renderer.height / 2);
        this.rotationLayer.x = this.renderer.width / 2;
        this.rotationLayer.y = this.renderer.height / 2;
        this.UILayer = new PIXI.Container();
        this.UILayer.addChild(this.rotationLayer);
        this.x = x;
        this.y = y;
    }
    set x(x) {
        this.pos.x = x;
        this.stage.x = this.width / 2 - x;
    }
    get x() {
        return this.pos.x;
    }
    set y(y) {
        this.pos.y = y;
        this.stage.y = this.height / 2 - y;
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
    resize(width, height) {
        const oldWidth = this.width;
        const oldHeight = this.height;
        if (width === undefined || height === undefined) {
            const view = this.renderer.view.getBoundingClientRect();
            width = view.width;
            height = view.height;
        }
        this.renderer.resize(width, height);
        this.UILayer.scale.set(width / oldWidth, height / oldHeight);
    }
    getScreenPos(sprite) {
        const p = sprite.getGlobalPosition();
        const c = this.renderer.view.getBoundingClientRect();
        p.x += c.left;
        p.y += c.top;
        return p;
    }
    target(container) {
        this.x = container.x;
        this.y = container.y;
    }
    addText(text, style, x = 0, y = 0) {
        const t = new PIXI.Text(text, style);
        t.roundPixels = true;
        t.x = x;
        t.y = y;
        this.UILayer.addChild(t);
        return t;
    }
    render() {
        if (this.shake > 0) {
            const offsetX = this.maxShakeOffset * this.shake ** 2 * (Math.random() * 2 - 1);
            const offsetY = this.maxShakeOffset * this.shake ** 2 * (Math.random() * 2 - 1);
            this.stage.x = this.x + this.width / 2 - offsetX;
            this.stage.y = this.y + this.height / 2 - offsetY;
            this.shake -= this.shakeDecrease;
        }
        this.renderer.render(this.UILayer);
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
            globalThis.cam.stage.addChild(this.visual);
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
        if (typeof (filter) === "string")
            filter = [filter];
        for (const c of Collider.allColliders) {
            if (Collider.touching(checkCol, c)) {
                if (!filter || filter.includes(c.gameObj.tag))
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
        this.combo = 1;
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
                    globalThis.cam.shake = 0.25;
                    globalThis.frameHalt = 5;
                    Player.attackSound.play();
                    if (faster) {
                        this.combo = Enemy.combo;
                        e.combo = ++Enemy.combo;
                    }
                    else {
                        e.combo = Enemy.combo;
                        this.combo = ++Enemy.combo;
                    }
                    const i = (Enemy.combo > Enemy.comboSounds.length)
                        ? Enemy.comboSounds.length - 1
                        : Enemy.combo - 2;
                    Enemy.comboSounds[i].play();
                    const points = 5 * Enemy.combo ** 2;
                    globalThis.score += points;
                    const pos = this.sprite.getGlobalPosition();
                    flashScore(points, pos.x, pos.y - 50, 0x3083dc);
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
                if (Math.random() < 0.8 && (this.state === EnemyState.DASH ||
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
    static update() {
        for (const e of Enemy.enemies) {
            if (e.state === EnemyState.INACTIVE) {
                e.destroy();
                continue;
            }
            e.update();
        }
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
                    globalThis.score += 50 * this.combo ** 2;
                    const screenPos = this.sprite.getGlobalPosition();
                    flashScore(50 * this.combo ** 2, screenPos.x, screenPos.y);
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
                else if (angleAligned &&
                    globalThis.player.state !== PlayerState.KNOCK_BACK) {
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
                this.combo = 1;
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
        Enemy.enemies = Enemy.enemies.filter(e => {
            return e !== this;
        });
    }
    static spawn(numEnemies, radius = 250, minRadius = 75) {
        for (let i = 0; i < numEnemies; i++) {
            let x, y, attempt = 0;
            do {
                attempt++;
                const r = Math.floor((Math.random() * (radius - minRadius)) + minRadius);
                const angle = Math.random() * 360;
                x = r * Math.sin(angle);
                y = r * Math.cos(angle);
            } while (Collider.circleCheck(x, y, 20, ["enemy", "player"]).length > 0
                && attempt < 100);
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
Enemy.combo = 1;
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
        globalThis.cam.stage.addChild(this);
    }
}
var TutorialStage;
(function (TutorialStage) {
    TutorialStage[TutorialStage["INTRO"] = 0] = "INTRO";
    TutorialStage[TutorialStage["MOVEMENT"] = 1] = "MOVEMENT";
    TutorialStage[TutorialStage["AIMING"] = 2] = "AIMING";
    TutorialStage[TutorialStage["FULLCHARGE"] = 3] = "FULLCHARGE";
    TutorialStage[TutorialStage["CONCLUSION"] = 4] = "CONCLUSION";
    TutorialStage[TutorialStage["ENDED"] = 5] = "ENDED";
})(TutorialStage || (TutorialStage = {}));
class Tutorial {
    static update() {
        if (Tutorial.skip) {
            tutorialText.destroy();
            tutorialSubtext.destroy();
            this.state = TutorialStage.ENDED;
        }
        switch (this.state) {
            case TutorialStage.INTRO: {
                if (Timer.check("tutorialStart", 3000))
                    this.state = TutorialStage.MOVEMENT;
                break;
            }
            case TutorialStage.MOVEMENT: {
                this.updateTutText("Use W,A,S,D to move.");
                if (globalThis.UP)
                    this.tryUp = true;
                if (globalThis.DOWN)
                    this.tryDown = true;
                if (globalThis.LEFT)
                    this.tryLeft = true;
                if (globalThis.RIGHT)
                    this.tryRight = true;
                if (this.tryUp && this.tryDown && this.tryLeft && this.tryRight)
                    this.state = TutorialStage.AIMING;
                break;
            }
            case TutorialStage.AIMING: {
                tutorialText.style.fontSize = "20px";
                this.updateTutText("Aim with the mouse cursor.\nHold Left Mouse Button\nto charge your body slam!");
                if (globalThis.LEFT_MOUSE)
                    this.chargeStart = true;
                if (this.chargeStart && !globalThis.LEFT_MOUSE)
                    this.state = TutorialStage.FULLCHARGE;
                break;
            }
            case TutorialStage.FULLCHARGE: {
                this.updateTutText("Hold down the\nLeft Mouse button\nto fully charge your slam!");
                this.updateTutSubText("Try to chain hits together\nfor a multiplier!");
                if (player.indicator.height === 100)
                    this.chargeFull = true;
                if (this.chargeFull && !globalThis.LEFT_MOUSE)
                    this.state = TutorialStage.CONCLUSION;
                break;
            }
            case TutorialStage.CONCLUSION: {
                this.updateTutText("Looking good!\nMake sure you're the last\none on the platform\nto win the round!");
                this.updateTutSubText("Press spacebar to start the game!");
                if (globalThis.SPACE) {
                    tutorialText.destroy();
                    tutorialSubtext.destroy();
                    this.state = TutorialStage.ENDED;
                }
                break;
            }
        }
        if (player.state === PlayerState.DEAD) {
            this.updateTutSubText("Be careful!");
        }
    }
    static get running() {
        return !Tutorial.skip && Tutorial.state !== TutorialStage.ENDED;
    }
    static updateTutText(t) {
        try {
            tutorialText.text = t;
            tutorialText.x = cam.width / 2 - tutorialText.width / 2;
            tutorialText.y = cam.height / 2 - tutorialText.height - 40;
        }
        catch (e) { }
    }
    static updateTutSubText(t) {
        try {
            tutorialSubtext.text = t;
            tutorialSubtext.x = cam.width / 2 - tutorialSubtext.width / 2;
            tutorialSubtext.y = cam.height / 2 + tutorialSubtext.height + 50;
            tutorialSubtext.alpha = 1;
        }
        catch (e) { }
    }
}
Tutorial.skip = false;
Tutorial.state = TutorialStage.INTRO;
Tutorial.tryUp = false;
Tutorial.tryDown = false;
Tutorial.tryLeft = false;
Tutorial.tryRight = false;
Tutorial.chargeStart = false;
Tutorial.chargeFull = false;
class Timer {
    static check(id, duration, currTime = performance.now()) {
        if (!Timer.timers.has(id))
            Timer.timers.set(id, currTime);
        const startTime = Timer.timers.get(id);
        if (currTime - startTime >= duration) {
            return true;
        }
        else {
            return false;
        }
    }
    static start(id, currTime = performance.now()) {
        Timer.timers.set(id, currTime);
    }
    static remove(id) {
        Timer.timers.delete(id);
    }
}
Timer.timers = new Map();
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
        this.knockBackMag = 15;
        this.maxDashMag = 40;
        this.maxAimTime = 500;
        this.lives = 10;
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
                        Enemy.combo = 1;
                        e.combo = 1;
                        e.sprite.angle = this.sprite.angle;
                        globalThis.cam.shake = .5 * (this.velocity.mag / this.maxDashMag + 0.1);
                        globalThis.frameHalt = 5;
                        e.velocity.set(Vector.mult(collisionVector, this.velocity.mag));
                        Player.attackSound.play();
                        e.state = EnemyState.DASH_KNOCK_BACK;
                        globalThis.score += 5;
                    }
                    else {
                        Player.smallHitSound.play();
                    }
                    this.velocity.set(Vector.mult(collisionVector, -1));
                }
                else {
                    globalThis.cam.shake = 0.35;
                    globalThis.frameHalt = 5;
                    if (this.state !== PlayerState.KNOCK_BACK) {
                        this.velocity.set(Vector.mult(collisionVector, -this.knockBackMag));
                    }
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
        return globalThis.cam.getScreenPos(this.sprite);
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
                    if (Tutorial.running || --this.lives > 0)
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
        Enemy.combo = 1;
    }
    reInitialize() {
        globalThis.cam.stage.addChild(this.indicator);
        globalThis.cam.stage.addChild(this.sprite);
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
var Howl;
var WebFont;
const levelUpSound = new Howl({
    src: ['./assets/audio/levelup.wav'],
    volume: 1
});
const gameOverSound = new Howl({
    src: ['./assets/audio/gameover.wav'],
    volume: 0.3
});
var cam = new Camera();
var player;
let platform;
let level = 0;
var score = 0;
let highScore = 0;
if (localStorage)
    highScore = parseInt(localStorage.getItem("highscore")) || 0;
let oldHighScore = 0;
let scoreBoard;
let highScoreBoard;
let gameOverScreen;
let levelText;
let livesCounter;
let floatScore;
let tutorialText;
let tutorialSubtext;
var flashScore = function (score, x, y, color = 0x3083dc) {
    floatScore.text = (score > 0) ? "+" + score.toString() : score.toString();
    x = Math.min(cam.width - floatScore.width - 10, x);
    x = Math.max(10, x);
    y = Math.min(cam.height - floatScore.height - 10, y);
    y = Math.max(10, y);
    floatScore.x = x;
    floatScore.y = y;
    floatScore.alpha = 1;
    floatScore.style.fill = color;
};
WebFont.load({
    google: {
        families: ['Press Start 2P']
    },
    active: e => {
        scoreBoard = cam.addText("Score:\n0", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "fontSize": "20px"
        }, 25, 25);
        highScoreBoard = cam.addText("High\nScore:\n" + highScore, {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "fontSize": "20px"
        }, 25, 0);
        highScoreBoard.y = cam.height - highScoreBoard.height - 25;
        livesCounter = cam.addText("Lives:\n0", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "align": "center",
            "fontSize": "20px"
        }, 0, 0);
        livesCounter.y = cam.height - livesCounter.height - 25;
        livesCounter.x = cam.width - livesCounter.width - 25;
        levelText = cam.addText("Level\n0", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "align": "center",
            "fontSize": "20px"
        }, 0, 25);
        levelText.x = cam.width - levelText.width - 25;
        floatScore = cam.addText("", {
            "fontFamily": "Press Start 2P",
            "fill": 0xFFFFFF,
            "alpha": 0,
            "fontSize": "20px"
        });
        gameOverScreen = cam.addText("Game Over!\n\nPress\nSpacebar\nto play again", {
            "fontFamily": "Press Start 2P",
            "fill": 0x000000,
            "fontSize": "32px",
            "align": "center"
        });
        gameOverScreen.x = cam.width / 2 - gameOverScreen.width / 2;
        gameOverScreen.y = cam.height / 2 - gameOverScreen.height / 2;
        gameOverScreen.alpha = 0;
        tutorialText = cam.addText("Welcome to\nLast Man Standing!", {
            "fontFamily": "Press Start 2P",
            "fill": 0x000000,
            "fontSize": "24px",
            "align": "center"
        });
        tutorialText.x = cam.width / 2 - tutorialText.width / 2;
        tutorialText.y = cam.height / 2 - tutorialText.height - 50;
        tutorialSubtext = cam.addText("Be careful not to\nthrow yourself off the platform!", {
            "fontFamily": "Press Start 2P",
            "fill": 0x000000,
            "fontSize": "14px",
            "align": "center"
        });
        tutorialSubtext.x = cam.width / 2 - tutorialSubtext.width / 2;
        tutorialSubtext.y = cam.height / 2 + tutorialSubtext.height + 100;
        tutorialSubtext.alpha = 0;
        PIXI.Loader.shared
            .add("sheet", "./spritesheets/sheet.json")
            .load(init);
    }
});
var frameID;
function init(loader, resources) {
    const sheet = resources["sheet"].spritesheet;
    globalThis.spritesheet = sheet;
    oldHighScore = highScore;
    platform = new Platform();
    player = new Player();
    Timer.start("tutorialStart");
    frameID = window.requestAnimationFrame(tutorialTick);
}
function tutorialTick() {
    Tutorial.update();
    Collider.update();
    player.update();
    cam.render();
    if (Tutorial.running) {
        frameID = window.requestAnimationFrame(tutorialTick);
    }
    else {
        frameID = window.requestAnimationFrame(tick);
    }
}
var frameHalt = 0;
let gameOver = false;
function tick() {
    if (frameHalt > 0) {
        --frameHalt;
        frameID = window.requestAnimationFrame(tick);
        cam.render();
        return;
    }
    score = (score < 0) ? 0 : score;
    scoreBoard.text = "Score:\n" + score;
    livesCounter.text = "Lives:\n" + player.lives;
    if (floatScore.alpha > 0) {
        floatScore.alpha -= 0.01;
    }
    if (gameOver) {
        if (globalThis.SPACE)
            reset();
        cam.render();
        frameID = window.requestAnimationFrame(tick);
        return;
    }
    Collider.update();
    player.update();
    Enemy.update();
    if (Enemy.enemies.length === 0) {
        levelText.text = "Level\n" + ++level;
        Enemy.spawn(level);
        levelUpSound.play();
        setTimeout(() => { levelText.alpha = 0; }, 500);
        setTimeout(() => { levelText.alpha = 1; }, 1000);
        setTimeout(() => { levelText.alpha = 0; }, 1500);
        setTimeout(() => { levelText.alpha = 1; }, 2000);
    }
    cam.render();
    if (score > highScore) {
        highScore = score;
        highScoreBoard.text = "High\nScore:\n" + highScore;
    }
    if (player.lives <= 0) {
        Enemy.clear();
        gameOver = true;
        gameOverScreen.alpha = 1;
        gameOverSound.play();
        if (highScore > oldHighScore) {
            setTimeout(() => { highScoreBoard.alpha = 0; }, 500);
            setTimeout(() => { highScoreBoard.alpha = 1; }, 1000);
            setTimeout(() => { highScoreBoard.alpha = 0; }, 1500);
            setTimeout(() => { highScoreBoard.alpha = 1; }, 2000);
        }
    }
    frameID = window.requestAnimationFrame(tick);
}
function reset() {
    Enemy.clear();
    player.lives = 10;
    player.respawn();
    level = 0;
    score = 0;
    gameOver = false;
    gameOverScreen.alpha = 0;
    oldHighScore = highScore;
    levelUpSound.play();
}
window.addEventListener("beforeunload", () => {
    if (localStorage)
        localStorage.setItem("highscore", highScore.toString());
});
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
        case " ":
            globalThis.SPACE = true;
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
        case " ":
            globalThis.SPACE = false;
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
        globalThis.cam.stage.addChild(this.graphic);
        Collider.allColliders.push(this.collider);
    }
}
//# sourceMappingURL=index.js.map