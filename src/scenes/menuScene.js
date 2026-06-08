import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../config/constants.js"
import { UI } from "../config/uiConfig.js"
import { tickMenuScroll, drawMenuScrollingWorld } from "../render/uiBackground.js"
import {
    drawAngryBirdsTitle,
    drawUiButton,
    drawUiHint,
    drawMenuBird,
    buttonHit,
} from "../render/uiRenderer.js"

const PLAY_BTN = {
    x: (INTERNAL_WIDTH - 140) / 2,
    y: INTERNAL_HEIGHT / 2 + 24,
    w: 140,
    h: UI.BTN_H,
}

export class MenuScene {

    constructor() {
        this.blinkTimer = 0
        this.blinkVisible = true
        this.scrollX = 0
        this.time = 0
        this._playHover = false
    }

    onEnter() {
        this.gameState.reset()
        this.soundManager?.unlockAudio()
        this.soundManager?.playMusic("theme")
    }

    update(dt) {
        this.time += dt
        this.scrollX = tickMenuScroll(this.scrollX, dt)

        this.blinkTimer += dt
        if (this.blinkTimer >= 0.55) {
            this.blinkTimer = 0
            this.blinkVisible = !this.blinkVisible
        }

        const input = this.inputManager
        this._playHover = buttonHit(
            input.mouseBufferX, input.mouseBufferY,
            PLAY_BTN.x, PLAY_BTN.y, PLAY_BTN.w, PLAY_BTN.h
        )
        if (this._playHover && input.mouseJustDown) {
            this.manager.transition("levelSelect")
        }
    }

    render(buffer) {
        const assets = this.manager?.assetManager
        drawMenuScrollingWorld(buffer, assets, this.scrollX)

        drawAngryBirdsTitle(buffer, INTERNAL_WIDTH / 2, 78)
        drawMenuBird(buffer, assets, this.time)

        drawUiButton(
            buffer, PLAY_BTN.x, PLAY_BTN.y, PLAY_BTN.w, PLAY_BTN.h,
            "PLAY", this._playHover || this.blinkVisible
        )

        drawUiHint(buffer, "CLICK TO PLAY", INTERNAL_HEIGHT - 36, this.blinkVisible)
    }

}
