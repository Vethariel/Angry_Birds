import { INTERNAL_HEIGHT } from "../config/constants.js"
import { LEVELS } from "../levels/levels.js"
import { UI } from "../config/uiConfig.js"
import {
    drawOverlayDim,
    drawOverlayTitle,
    drawUiButton,
    drawTextShadow,
    layoutButtons,
    handleMouseButtons,
} from "../render/uiRenderer.js"

const BUTTONS = [
    { id: "repeat", label: "REPEAT" },
    { id: "menu",   label: "GO TO MENU" },
    { id: "next",   label: "NEXT LEVEL" },
]

export class VictoryOverlay {

    constructor() {
        this.selected = 0
        this._layout = null
    }

    onEnter() {
        this.selected = 2
        this._layout = layoutButtons(BUTTONS.length, UI.BTN_W, UI.BTN_H, UI.BTN_GAP, INTERNAL_HEIGHT / 2 + 6)
        this.gameState.save()
    }

    onExit() {}

    update() {
        const hover = handleMouseButtons(this.inputManager, this._layout, (i) => this._activate(i))
        if (hover !== null) this.selected = hover
    }

    render(buffer) {
        drawOverlayDim(buffer)

        drawOverlayTitle(buffer, "VICTORY!", buffer.height / 2 - 72, UI.ACCENT_YELLOW)
        drawTextShadow(buffer, `SCORE ${this.gameState.score}`, buffer.width / 2, buffer.height / 2 - 56, {
            size: 9,
            fill: UI.TEXT_CREAM,
            shadow: UI.TEXT_SHADOW,
        })

        for (let i = 0; i < BUTTONS.length; i++) {
            const { x, y, w, h } = this._layout[i]
            drawUiButton(buffer, x, y, w, h, BUTTONS[i].label, i === this.selected)
        }
    }

    _activate(index) {
        const id = BUTTONS[index] && BUTTONS[index].id
        if (id === "repeat") this._repeat()
        else if (id === "menu") this._goToMenu()
        else this._nextLevel()
    }

    _repeat() {
        this.manager.transition("gameplay")
    }

    _goToMenu() {
        this.manager.transition("menu")
    }

    _nextLevel() {
        const last = LEVELS.length - 1
        if (this.gameState.currentLevelIndex < last) {
            this.gameState.currentLevelIndex++
            this.gameState.unlockedLevels = Math.max(
                this.gameState.unlockedLevels,
                this.gameState.currentLevelIndex + 1
            )
        }
        this.manager.transition("gameplay")
    }
}
