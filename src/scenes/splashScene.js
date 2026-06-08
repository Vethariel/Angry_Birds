import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../config/constants.js"
import { tickMenuScroll, drawMenuScrollingWorld } from "../render/uiBackground.js"
import {
    drawAngryBirdsTitle,
    drawUiHint,
    drawMenuBird,
    buttonHit,
} from "../render/uiRenderer.js"

const START_ZONE = {
    x: INTERNAL_WIDTH / 2 - 120,
    y: INTERNAL_HEIGHT / 2 + 20,
    w: 240,
    h: 80,
}

export class SplashScene {

    constructor() {
        this.blinkTimer = 0
        this.blinkVisible = true
        this.scrollX = 0
        this.time = 0
    }

    onEnter() {}

    update(dt) {
        this.time += dt
        this.scrollX = tickMenuScroll(this.scrollX, dt)

        this.blinkTimer += dt
        if (this.blinkTimer >= 0.55) {
            this.blinkTimer = 0
            this.blinkVisible = !this.blinkVisible
        }

        const input = this.inputManager
        if (
            input.mouseJustDown &&
            buttonHit(input.mouseBufferX, input.mouseBufferY, START_ZONE.x, START_ZONE.y, START_ZONE.w, START_ZONE.h)
        ) {
            this.soundManager?.unlockAudio()
            this.manager.transition("menu")
        }
    }

    render(buffer) {
        const assets = this.manager?.assetManager
        drawMenuScrollingWorld(buffer, assets, this.scrollX)

        drawAngryBirdsTitle(buffer, INTERNAL_WIDTH / 2, INTERNAL_HEIGHT / 2 - 20)
        drawMenuBird(buffer, assets, this.time)

        drawUiHint(buffer, "CLICK TO START", INTERNAL_HEIGHT / 2 + 52, this.blinkVisible)
    }

}
