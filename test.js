var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AnimatedSprite = (function () {
    function AnimatedSprite(stage, animName, animation, interval, offset) {
        if (offset === void 0) { offset = 0; }
        this.animations = [];
        this.sprite = new PIXI.AnimatedSprite(animation, false);
        this.addAnimation(animName, animation, interval, offset);
        this.playAnimation(animName);
        stage.addChild(this.sprite);
    }
    Object.defineProperty(AnimatedSprite.prototype, "x", {
        get: function () {
            return this.sprite.x;
        },
        set: function (x) {
            this.sprite.x = x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnimatedSprite.prototype, "y", {
        get: function () {
            return this.sprite.y;
        },
        set: function (y) {
            this.sprite.y = y;
        },
        enumerable: false,
        configurable: true
    });
    AnimatedSprite.prototype.addAnimation = function (animName, animation, interval, offset) {
        if (offset === void 0) { offset = 0; }
        this.animations[animName] = new Anim(animation, interval, offset);
    };
    AnimatedSprite.prototype.playAnimation = function (name) {
        var anim = this.animations[name];
        this.sprite.textures = anim.animation;
        this.interval = anim.interval;
        this.offset = anim.offset;
        this.sprite.gotoAndStop(0);
    };
    AnimatedSprite.prototype.update = function (frame) {
        if ((frame - this.offset) % this.interval === 0) {
            this.sprite.gotoAndStop(this.sprite.currentFrame + 1);
        }
    };
    return AnimatedSprite;
}());
var Anim = (function () {
    function Anim(animation, interval, offset) {
        if (offset === void 0) { offset = 0; }
        this.animation = animation;
        this.interval = interval;
        this.offset = offset;
    }
    return Anim;
}());
var Player = (function () {
    function Player(img) {
        this.speed = 5;
        this._x = 0;
        this._y = 0;
        this.sprite = new Sprite(img);
    }
    Object.defineProperty(Player.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (x) {
            this._x = x;
            this.sprite.x = x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (y) {
            this._y = y;
            this.sprite.y = y;
        },
        enumerable: false,
        configurable: true
    });
    Player.prototype.lookAt = function (x, y) {
        var p = this.sprite.getGlobalPosition();
        var rotation = Math.atan2(x - p.x, p.y - y);
        this.sprite.rotation = rotation;
    };
    Player.prototype.update = function () {
        if (globalThis.UP)
            player.y -= player.speed;
        if (globalThis.DOWN)
            player.y += player.speed;
        if (globalThis.LEFT)
            player.x -= player.speed;
        if (globalThis.RIGHT)
            player.x += player.speed;
        player.lookAt(globalThis.mouseX, globalThis.mouseY);
    };
    return Player;
}());
var Sprite = (function (_super) {
    __extends(Sprite, _super);
    function Sprite(texture) {
        var _this = _super.call(this, texture) || this;
        _this.pivot.set(_this.width / 2, _this.height / 2);
        Sprite.stage.addChild(_this);
        return _this;
    }
    return Sprite;
}(PIXI.Sprite));
var Camera = (function () {
    function Camera(selector, x, y) {
        if (selector === void 0) { selector = "body"; }
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.renderer = PIXI.autoDetectRenderer();
        this.renderer.backgroundColor = 0x000000000;
        document.querySelector(selector).appendChild(this.renderer.view);
        this.width = this.renderer.width;
        this.height = this.renderer.height;
        this.stage = new PIXI.Container();
        this.rotationLayer = new PIXI.Container();
        this.rotationLayer.addChild(this.stage);
        this.rotationLayer.pivot.set(this.renderer.width / 2, this.renderer.height / 2);
        this.rotationLayer.x = this.renderer.width / 2;
        this.rotationLayer.y = this.renderer.height / 2;
        this.x = x;
        this.y = y;
        Sprite.stage = this.stage;
    }
    Object.defineProperty(Camera.prototype, "x", {
        get: function () {
            return this.width / 2 - this.stage.x;
        },
        set: function (x) {
            this.stage.x = this.width / 2 - x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "y", {
        get: function () {
            return this.height / 2 - this.stage.y;
        },
        set: function (y) {
            this.stage.y = this.height / 2 - y;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Camera.prototype, "angle", {
        get: function () {
            return this.rotationLayer.angle;
        },
        set: function (a) {
            this.rotationLayer.angle = a;
        },
        enumerable: false,
        configurable: true
    });
    Camera.prototype.target = function (container) {
        this.x = container.x;
        this.y = container.y;
    };
    Camera.prototype.render = function () {
        this.renderer.render(this.rotationLayer);
    };
    return Camera;
}());
var cam = new Camera();
var stage = cam.stage;
PIXI.Loader.shared
    .add("sheet", "./spritesheets/sheet.json")
    .load(init);
var player;
function init(loader, resources) {
    var sheet = resources["sheet"].spritesheet;
    var platform = new PIXI.Graphics();
    platform.lineStyle(2, 0x000000000);
    platform.beginFill(0xFFFFFF);
    platform.drawCircle(0, 0, cam.height / 2 - 10);
    platform.endFill();
    stage.addChild(platform);
    player = new Player(sheet.textures["player.png"]);
    window.requestAnimationFrame(tick);
}
var frameCount = 0;
function tick() {
    ++frameCount;
    player.update();
    cam.render();
    window.requestAnimationFrame(tick);
}
var UP, DOWN, LEFT, RIGHT;
var mouseX = 0;
var mouseY = 0;
window.addEventListener("keydown", function (e) {
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
window.addEventListener("keyup", function (e) {
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
document.querySelector("canvas").addEventListener("mousemove", function (e) {
    globalThis.mouseX = e.offsetX;
    globalThis.mouseY = e.offsetY;
});
var Collider = (function () {
    function Collider() {
    }
    return Collider;
}());
//# sourceMappingURL=test.js.map