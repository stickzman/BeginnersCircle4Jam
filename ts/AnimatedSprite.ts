class AnimatedSprite {
    private animations: Anim[] = []
    private interval: number
    private offset: number
    sprite: PIXI.AnimatedSprite

    constructor(
        stage: PIXI.Container,      // Container to add sprite to
        animName: string,           // ID of animation within AnimatedSprite
        animation: PIXI.Texture[],  // Animation frames
        interval: number,           // # of frames between each anim frame
        offset = 0                  // # of frames before 1st anim frame
    ) {
        this.sprite = new PIXI.AnimatedSprite(animation, false)
        this.addAnimation(animName, animation, interval, offset)
        this.playAnimation(animName)
        stage.addChild(this.sprite)
    }

    set x(x: number) {
        this.sprite.x = x
    }

    set y(y: number) {
        this.sprite.y = y
    }

    get x() {
        return this.sprite.x
    }

    get y() {
        return this.sprite.y
    }

    addAnimation(
        animName: string,
        animation: PIXI.Texture[],
        interval: number,
        offset = 0
    ) {
        this.animations[animName] = new Anim(animation, interval, offset)
    }

    playAnimation(name: string) {
        const anim = this.animations[name]
        this.sprite.textures = anim.animation
        this.interval = anim.interval
        this.offset = anim.offset
        this.sprite.gotoAndStop(0)
    }

    update(frame: number) {
        if ((frame - this.offset) % this.interval === 0) {
            this.sprite.gotoAndStop(this.sprite.currentFrame + 1)
        }
    }
}

class Anim {
    constructor(
        public animation: PIXI.Texture[],  // Animation frames
        public interval: number,           // # of frames between each anim frame
        public offset = 0                  // # of frames before 1st anim frame
    ) { }
}
