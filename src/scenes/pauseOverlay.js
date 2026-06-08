import { INTERNAL_HEIGHT } from "../config/constants.js"
import { UI } from "../config/uiConfig.js"
import {
    drawOverlayDim,
    drawOverlayTitle,
    drawUiButton,
    layoutButtons,
    handleMouseButtons,
} from "../render/uiRenderer.js"

const BUTTONS = [
    { id: "repeat", label: "REPEAT" },
    { id: "menu",   label: "GO TO MENU" },
    { id: "resume", label: "KEEP PLAYING" },
]

export class PauseOverlay {

    constructor() {
        this.selected = 0
        this._layout = null
    }

    onEnter() {
        this.selected = 2
        this._layout = layoutButtons(BUTTONS.length, UI.BTN_W, UI.BTN_H, UI.BTN_GAP, INTERNAL_HEIGHT / 2 + 4)
    }

    onExit() {}

    update() {
        const hover = handleMouseButtons(this.inputManager, this._layout, (i) => this._activate(i))
        if (hover !== null) this.selected = hover
    }

    render(buffer) {
        drawOverlayDim(buffer, 150)
        drawOverlayTitle(buffer, "PAUSED", buffer.height / 2 - 58, UI.TEXT_CREAM)

        for (let i = 0; i < BUTTONS.length; i++) {
            const { x, y, w, h } = this._layout[i]
            drawUiButton(buffer, x, y, w, h, BUTTONS[i].label, i === this.selected)
        }
    }

    _activate(index) {
        const id = BUTTONS[index] && BUTTONS[index].id
        if (id === "repeat") this._repeat()
        else if (id === "menu") this._goToMenu()
        else this._resume()
    }

    _resume() {
        this.manager.hideOverlay()
    }

    _repeat() {
        this.manager.transition("gameplay")
    }

    _goToMenu() {
        this.manager.transition("menu")
    }
}
