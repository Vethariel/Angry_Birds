// systems/inputSystem.js

import { SLINGSHOT_X, SLING_RADIUS } from "../config/constants.js"

export class InputSystem {

    constructor() {
        this._dragStartX = null
        this._dragStartCamX = null
    }

    // devuelve un comando al GameplayScene según el estado
    update(world, state, inputManager, camera) {

        if (state.name === 'INTRO_PAN') return null

        if (state.name === 'AIMING') {
            return this._updateAiming(world, inputManager, camera)
        }

        if (state.name === 'PAN_DRAG') {
            return this._updatePanDrag(inputManager, camera)
        }

        if (state.name === 'PULLING') {
            return this._updatePulling(world, inputManager, camera)
        }

        if (state.name === 'IN_FLIGHT') {
            return this._updateInFlight(inputManager)
        }

        return null
    }

    // ── Estados ───────────────────────────────────────────────

    _updateAiming(world, inputManager, camera) {
        if (!inputManager.mouseJustDown) return null

        const mx = inputManager.mouseWorldX
        const my = inputManager.mouseWorldY

        if (this._nearSlingshot(mx, my, world)) {
            return { type: 'START_PULLING' }
        }

        // click fuera de la honda → pan drag
        this._dragStartX = inputManager.mouseX
        this._dragStartCamX = camera.x
        return { type: 'START_PAN_DRAG' }
    }

    _updatePanDrag(inputManager, camera) {
        if (inputManager.mouseDown && this._dragStartX !== null) {
            const scale = this._scale(camera)
            const dx = (inputManager.mouseX - this._dragStartX) / scale
            camera.x = this._dragStartCamX - dx
            camera.clamp()
        }

        if (inputManager.mouseJustUp) {
            this._dragStartX = null
            return { type: 'END_PAN_DRAG' }
        }

        return null
    }

    _updatePulling(world, inputManager, camera) {
        const mx = inputManager.mouseWorldX
        const my = inputManager.mouseWorldY
        const sx = world.slingshot.x
        const sy = world.slingshot.y

        let dx = mx - sx
        let dy = my - sy
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > SLING_RADIUS) {
            dx = (dx / dist) * SLING_RADIUS
            dy = (dy / dist) * SLING_RADIUS
        }

        // actualiza pull vector en el world para que BirdSystem lo lea
        world.pullVector = { x: dx, y: dy }

        if (inputManager.mouseJustUp) {
            return { type: 'RELEASE', pullVector: world.pullVector }
        }

        return null
    }

    _updateInFlight(inputManager) {
        if (inputManager.mouseJustDown) {
            return { type: 'USE_ABILITY' }
        }
        return null
    }

    // ── Helpers ───────────────────────────────────────────────

    _nearSlingshot(wx, wy, world) {
        const dx = wx - world.slingshot.x
        const dy = wy - world.slingshot.y
        return Math.sqrt(dx * dx + dy * dy) < SLING_RADIUS
    }

    _scale(camera) {
        return Math.max(1, Math.floor(Math.min(
            window.innerWidth / camera.viewW,
            window.innerHeight / camera.viewH
        )))
    }
}
