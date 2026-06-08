// SoundSystem — traduce world.events y cambios de estado a SoundManager.
// Escenas y overlays llaman al manager directamente para música.

const STATE = {
    DEFEAT_ANTICS: "DEFEAT_ANTICS",
    BIRD_SCORE_COUNT: "BIRD_SCORE_COUNT",
    VICTORY_CELEBRATION: "VICTORY_CELEBRATION",
}

export class SoundSystem {

    constructor() {
        /** True while birdFlying loop is allowed for the current shot. */
        this._flyingActive = false
    }

    update(world, soundManager) {
        if (!soundManager) return

        for (const event of world.events) {
            const type = typeof event === "string" ? event : event.type

            switch (type) {
                case "birdShot":
                    soundManager.playSFX("birdShot")
                    this._startFlying(soundManager)
                    break
                case "birdNext":
                    soundManager.playSFX("birdNext")
                    break
                case "birdDestroyed":
                    this._stopFlying(soundManager)
                    soundManager.playSFX("birdDestroyed")
                    break
                case "birdCollision":
                    this._stopFlying(soundManager)
                    soundManager.playBirdCollision(event.impulse)
                    break
                case "blockCollision":
                    soundManager.playBlockCollision(event.blockType, event.impulse)
                    break
            }
        }

        world.events = []
    }

    onStateChange(soundManager, prev, next) {
        if (!soundManager) return

        if (next === "PULLING") {
            soundManager.playSFX("birdSelect")
        }

        if (next === "IMPACT_EVAL") {
            this._stopFlying(soundManager)
        }

        if (next === STATE.DEFEAT_ANTICS) {
            this._stopFlying(soundManager)
            soundManager.pauseMusic()
            soundManager.playOverlayMusic("defeat")
        }

        if (next === STATE.BIRD_SCORE_COUNT) {
            this._stopFlying(soundManager)
            soundManager.pauseMusic()
        }

        if (next === STATE.VICTORY_CELEBRATION) {
            this._stopFlying(soundManager)
            soundManager.pauseMusic()
            soundManager.playOverlayMusic("victory")
        }
    }

    _startFlying(soundManager) {
        if (this._flyingActive) return
        this._flyingActive = true
        soundManager.startLoop("birdFlying")
    }

    _stopFlying(soundManager) {
        if (!this._flyingActive) return
        this._flyingActive = false
        soundManager.stopFlyingLoop()
    }

    onPause(soundManager) {
        this._stopFlying(soundManager)
    }

    onResume() {
        // Flying SFX is one-shot per launch — never resume the loop.
    }

}
