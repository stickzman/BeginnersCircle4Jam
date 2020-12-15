enum TutorialStage {
    INTRO,
    MOVEMENT,
    AIMING,
    FULLCHARGE,
    CONCLUSION,
    ENDED
}
class Tutorial {
    static skip = false
    static state = TutorialStage.INTRO
    static tryUp = false
    static tryDown = false
    static tryLeft = false
    static tryRight = false
    static chargeStart = false
    static chargeFull = false

    static update() {
        if (Tutorial.skip) {
            tutorialText.destroy()
            tutorialSubtext.destroy()
            this.state = TutorialStage.ENDED
        }

        switch (this.state) {
            case TutorialStage.INTRO: {
                if (Timer.check("tutorialStart", 4000))
                    this.state = TutorialStage.MOVEMENT
                break
            }
            case TutorialStage.MOVEMENT: {
                this.updateTutText("Use W,A,S,D to move.")
                if (globalThis.UP) this.tryUp = true
                if (globalThis.DOWN) this.tryDown = true
                if (globalThis.LEFT) this.tryLeft = true
                if (globalThis.RIGHT) this.tryRight = true
                if (this.tryUp && this.tryDown && this.tryLeft && this.tryRight)
                    this.state = TutorialStage.AIMING
                break
            }
            case TutorialStage.AIMING: {
                tutorialText.style.fontSize = "20px"
                this.updateTutText("Aim with the mouse cursor.\nHold Left Mouse Button\nto charge your body slam!")
                if (globalThis.LEFT_MOUSE) this.chargeStart = true
                if (this.chargeStart && !globalThis.LEFT_MOUSE)
                    this.state = TutorialStage.FULLCHARGE
                break
            }
            case TutorialStage.FULLCHARGE: {
                this.updateTutText("Hold down the\nLeft Mouse button\nto fully charge your slam!")
                this.updateTutSubText("Try to chain hits together\nfor a multiplier!")
                if (player.indicator.height === 100) this.chargeFull = true
                if (this.chargeFull && !globalThis.LEFT_MOUSE)
                    this.state = TutorialStage.CONCLUSION
                break
            }
            case TutorialStage.CONCLUSION: {
                this.updateTutText("Looking good!\nMake sure you're the last\none on the platform\nto win the round!")
                this.updateTutSubText("Press spacebar to start the game!")
                if (globalThis.SPACE) {
                    tutorialText.destroy()
                    tutorialSubtext.destroy()
                    this.state = TutorialStage.ENDED
                }
                break
            }
        }
        if (player.state === PlayerState.DEAD) {
            this.updateTutSubText("Be careful!")
        }
    }

    static get running(): boolean {
        return !Tutorial.skip && Tutorial.state !== TutorialStage.ENDED
    }

    static updateTutText(t: string) {
        try {
            tutorialText.text = t
            tutorialText.x = cam.width/2 - tutorialText.width/2
            tutorialText.y = cam.height/2 - tutorialText.height - 40
        } catch(e) { }
    }
    static updateTutSubText(t: string) {
        try {
            tutorialSubtext.text = t
            tutorialSubtext.x = cam.width/2 - tutorialSubtext.width/2
            tutorialSubtext.y = cam.height/2 + tutorialSubtext.height + 50
            tutorialSubtext.alpha = 1
        } catch(e) { }
    }
}
