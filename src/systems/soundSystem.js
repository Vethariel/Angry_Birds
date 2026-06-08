// SoundSystem — traduce world.events y cambios de estado a SoundManager.
// Escenas y overlays llaman al manager directamente para música.

const STATE = {
    DEFEAT_ANTICS: "DEFEAT_ANTICS",
    BIRD_SCORE_COUNT: "BIRD_SCORE_COUNT",
    VICTORY_CELEBRATION: "VICTORY_CELEBRATION",
}

export class SoundSystem {

    update(world, soundManager) {
        if (!soundManager) return

        for (const event of world.events) {
            const type = typeof event === "string" ? event : event.type

            switch (type) {
                case "birdShot":
                    soundManager.playSFX("birdShot")
                    soundManager.startLoop("birdFlying")
                    break
                case "birdNext":
                    soundManager.playSFX("birdNext")
                    break
                case "birdDestroyed":
                    soundManager.stopLoop()
                    soundManager.playSFX("birdDestroyed")
                    break
                case "birdCollision":
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
            soundManager.stopLoop()
        }

        if (next === STATE.DEFEAT_ANTICS) {
            soundManager.stopLoop()
            soundManager.pauseMusic()
            soundManager.playOverlayMusic("defeat")
        }

        if (next === STATE.BIRD_SCORE_COUNT) {
            soundManager.stopLoop()
            soundManager.pauseMusic()
        }

        if (next === STATE.VICTORY_CELEBRATION) {
            soundManager.stopLoop()
            soundManager.pauseMusic()
            soundManager.playOverlayMusic("victory")
        }
    }

    onPause(soundManager) {
        soundManager?.stopLoop()
    }

    onResume(soundManager, state, world) {
        const bird = world?.activeBird
        if (state?.name === "IN_FLIGHT" && bird?.launched && !bird?.dead) {
            soundManager?.startLoop("birdFlying")
        }
    }

}
