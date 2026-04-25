
export class InputManager {

    constructor(p) {
        this.keysDown     = new Set()
        this.keysJustDown = new Set()
        this._p = p
        this.mouseClicked = false
    }

    onMousePressed() {
        this.mouseClicked = true
    }

    onKeyPressed(key) {
        if (!this.keysDown.has(key)) {
            this.keysJustDown.add(key)
        }
        this.keysDown.add(key)
    }

    onKeyReleased(key) {
        this.keysDown.delete(key)
    }

    // Llamar al inicio de cada frame para limpiar justDown
    flush() {
        this.keysJustDown.clear()
        this.mouseClicked = false
    }

    isDown(key)     { return this._p?.keyIsDown(key) ?? false}
    isJustDown(key) { return this.keysJustDown.has(key) }

    isJustDown(key) {
        if (key === 'mouse') return this.mouseClicked
        return this.keysJustDown.has(key)
    }

}