import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../config/constants.js"
import { LEVELS } from "../levels/levels.js"
import { UI } from "../config/uiConfig.js"
import { tickMenuScroll, drawMenuScrollingWorld } from "../render/uiBackground.js"
import {
    drawWoodPanel,
    drawSectionTitle,
    drawLevelCard,
    drawUiButton,
    drawUiHint,
    drawTextShadow,
    computeLevelGrid,
    buttonHit,
} from "../render/uiRenderer.js"

export class LevelSelectScene {

    constructor() {
        this.selectedIndex = 0
        this.scrollX = 0
        this._grid = null
        this._playBtn = null
        this._backBtn = null
        this._playHover = false
        this._backHover = false
    }

    onEnter() {
        this.selectedIndex = Math.max(0, this.gameState.unlockedLevels - 1)
        this._layoutUi()
    }

    _layoutUi() {
        const total = LEVELS.length
        this._grid = computeLevelGrid(total)
        const playY = this._grid.labelY + 28
        this._playBtn = { x: INTERNAL_WIDTH / 2 - 70, y: playY, w: 140, h: UI.BTN_H }
        this._backBtn = { x: 16, y: 16, w: 72, h: 24 }
    }

    update(dt) {
        this.scrollX = tickMenuScroll(this.scrollX, dt)
        const input = this.inputManager
        const unlocked = this.gameState.unlockedLevels

        if (this._grid) {
            for (const card of this._grid.cards) {
                if (!buttonHit(input.mouseBufferX, input.mouseBufferY, card.x, card.y, card.w, card.h)) {
                    continue
                }
                if (card.index < unlocked && input.mouseJustDown) {
                    this.selectedIndex = card.index
                }
            }
        }

        this._playHover = buttonHit(
            input.mouseBufferX, input.mouseBufferY,
            this._playBtn.x, this._playBtn.y, this._playBtn.w, this._playBtn.h
        )
        if (this._playHover && input.mouseJustDown) {
            this.gameState.currentLevelIndex = this.selectedIndex
            this.manager.transition("gameplay")
        }

        this._backHover = buttonHit(
            input.mouseBufferX, input.mouseBufferY,
            this._backBtn.x, this._backBtn.y, this._backBtn.w, this._backBtn.h
        )
        if (this._backHover && input.mouseJustDown) {
            this.manager.transition("menu")
        }
    }

    render(buffer) {
        const assets = this.manager?.assetManager
        drawMenuScrollingWorld(buffer, assets, this.scrollX)

        const W = buffer.width
        const total = LEVELS.length
        const unlocked = this.gameState.unlockedLevels
        const { cards, labelY } = this._grid ?? computeLevelGrid(total)

        drawWoodPanel(buffer, W / 2 - 108, 10, 216, 34)
        drawSectionTitle(buffer, "SELECT LEVEL", 28)

        drawUiButton(buffer, this._backBtn.x, this._backBtn.y, this._backBtn.w, this._backBtn.h, "BACK", this._backHover)

        for (const card of cards) {
            drawLevelCard(buffer, card.x, card.y, card.w, card.h, card.index + 1, {
                selected: card.index === this.selectedIndex,
                unlocked: card.index < unlocked,
            })
        }

        const level = LEVELS[this.selectedIndex]
        drawWoodPanel(buffer, W / 2 - 90, labelY - 14, 180, 36)
        drawTextShadow(buffer, `LEVEL ${this.selectedIndex + 1}`, W / 2, labelY, {
            size: 11,
            fill: UI.ACCENT_YELLOW,
            shadow: UI.TEXT_SHADOW,
        })
        if (level?.name) {
            drawTextShadow(buffer, level.name, W / 2, labelY + 14, {
                size: 7,
                fill: UI.TEXT_CREAM,
                shadow: UI.TEXT_SHADOW,
            })
        }

        const pb = this._playBtn
        drawUiButton(buffer, pb.x, pb.y, pb.w, pb.h, "PLAY", this._playHover)

        drawUiHint(buffer, "CLICK LEVEL  ·  PLAY TO START  ·  BACK", INTERNAL_HEIGHT - 24, true)
    }
}
