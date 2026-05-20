import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../config/constants.js"

const BUTTONS = [
    { id: 'repeat', label: 'REPEAT' },
    { id: 'menu',   label: 'GO TO MENU' },
]

const BTN_W = 152
const BTN_H = 22
const BTN_GAP = 8

export class GameOverOverlay {

    constructor() {
        this.selected = 0
        this._layout = null
    }

    onEnter() {
        this.selected = 0
        this._layout = this._computeLayout()
    }

    onExit() {}

    update() {
        const input = this.inputManager

        if (input.isJustDown('ArrowUp') || input.isJustDown('w')) {
            this.selected = (this.selected - 1 + BUTTONS.length) % BUTTONS.length
        }
        if (input.isJustDown('ArrowDown') || input.isJustDown('s')) {
            this.selected = (this.selected + 1) % BUTTONS.length
        }

        const hover = this._hitIndex(input.mouseBufferX, input.mouseBufferY)
        if (hover !== null) this.selected = hover

        if (input.isJustDown('Enter') || input.isJustDown(' ') || input.mouseJustDown) {
            this._activate(this.selected)
        }
    }

    render(buffer) {
        const W = buffer.width
        const H = buffer.height

        buffer.noStroke()
        buffer.fill(0, 0, 0, 180)
        buffer.rect(0, 0, W, H)

        buffer.fill(255, 80, 80)
        buffer.textAlign('center', 'center')
        buffer.textSize(14)
        buffer.text('GAME OVER', W / 2, H / 2 - 40)

        for (let i = 0; i < BUTTONS.length; i++) {
            this._drawButton(buffer, i, i === this.selected)
        }
    }

    _computeLayout() {
        const totalH = BUTTONS.length * BTN_H + (BUTTONS.length - 1) * BTN_GAP
        const startY = (INTERNAL_HEIGHT - totalH) / 2 + 10
        const x = (INTERNAL_WIDTH - BTN_W) / 2

        return BUTTONS.map((btn, i) => ({
            id: btn.id,
            x,
            y: startY + i * (BTN_H + BTN_GAP),
            w: BTN_W,
            h: BTN_H,
        }))
    }

    _drawButton(buffer, index, selected) {
        const { x, y, w, h } = this._layout[index]
        const label = BUTTONS[index].label

        buffer.noStroke()
        if (selected) buffer.fill(100, 200, 255)
        else buffer.fill(40, 80, 120)
        buffer.rect(x, y, w, h, 3)

        if (selected) {
            buffer.stroke(255)
            buffer.strokeWeight(1)
            buffer.noFill()
            buffer.rect(x, y, w, h, 3)
        }

        buffer.noStroke()
        buffer.fill(selected ? 0 : 220)
        buffer.textSize(8)
        buffer.textAlign('center', 'center')
        buffer.text(label, x + w / 2, y + h / 2 + 1)
    }

    _hitIndex(mx, my) {
        for (let i = 0; i < this._layout.length; i++) {
            const { x, y, w, h } = this._layout[i]
            if (mx >= x && mx <= x + w && my >= y && my <= y + h) return i
        }
        return null
    }

    _activate(index) {
        const id = BUTTONS[index] && BUTTONS[index].id
        if (id === 'repeat') this._repeat()
        else this._goToMenu()
    }

    _repeat() {
        this.manager.transition('gameplay')
    }

    _goToMenu() {
        this.manager.transition('menu')
    }
}
