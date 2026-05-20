// core/inputManager.js
export class InputManager {

    constructor(p) {
        this._p = p

        // ── Teclado ───────────────────────────────────────────
        this.keysDown     = new Set()
        this.keysJustDown = new Set()
        this.keysJustUp   = new Set()

        // ── Mouse — estado raw (coordenadas de pantalla) ──────
        this.mouseX       = 0
        this.mouseY       = 0
        this.mouseDown    = false
        this.mouseJustDown = false
        this.mouseJustUp  = false

        // ── Mouse — coordenadas mundo (calculadas por frame) ──
        this.mouseWorldX  = 0
        this.mouseWorldY  = 0

        // ── Mouse — coordenadas del buffer interno (UI / overlays) ──
        this.mouseBufferX = 0
        this.mouseBufferY = 0
    }

    // ── Llamado desde main.js ─────────────────────────────────

    onMousePressed() {
        this.mouseDown     = true
        this.mouseJustDown = true
    }

    onMouseReleased() {
        this.mouseDown    = false
        this.mouseJustUp  = true
    }

    onMouseMoved(x, y) {
        this.mouseX = x
        this.mouseY = y
    }

    onKeyPressed(key) {
        if (!this.keysDown.has(key)) this.keysJustDown.add(key)
        this.keysDown.add(key)
    }

    onKeyReleased(key) {
        this.keysDown.delete(key)
        this.keysJustUp.add(key)
    }

    // ── Llamado cada frame desde main.js antes del flush ─────
    // Recibe la cámara y la escala para calcular coordenadas mundo

    updateMouseWorld(camera, scale, offsetX, offsetY) {
        this.mouseBufferX = (this.mouseX - offsetX) / scale
        this.mouseBufferY = (this.mouseY - offsetY) / scale
        this.mouseWorldX = this.mouseBufferX + camera.x
        this.mouseWorldY = this.mouseBufferY + camera.y
    }

    // ── Limpieza al final del frame ───────────────────────────

    flush() {
        this.keysJustDown.clear()
        this.keysJustUp.clear()
        this.mouseJustDown = false
        this.mouseJustUp   = false
    }

    // ── API de consulta ───────────────────────────────────────

    isDown(key)     { return this.keysDown.has(key) }
    isJustDown(key) { return this.keysJustDown.has(key) }
    isJustUp(key)   { return this.keysJustUp.has(key) }
}