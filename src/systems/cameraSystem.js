// systems/cameraSystem.js
import { SLINGSHOT_X, INTERNAL_WIDTH, LEVEL_ORIGIN_X } from "../config/constants.js"

export class CameraSystem {

    update(world, state, camera, dt) {

        if (state.name === 'INTRO_PAN') {
            this._updateIntroPan(state, camera, dt)
        }
    }

    _updateIntroPan(state, camera, dt) {

        const PAUSE    = 1.5   // segundos mostrando la tercera pantalla
        const TRAVEL   = 1.0   // segundos viajando a la honda

        if (state.timer < PAUSE) {
            // cámara quieta en la tercera pantalla
            camera.x = LEVEL_ORIGIN_X
            camera.clamp()
            return
        }

        // viaje de tercera pantalla → honda
        const t       = Math.min((state.timer - PAUSE) / TRAVEL, 1)
        const ease    = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

        const fromX   = LEVEL_ORIGIN_X
        const toX     = Math.max(0, SLINGSHOT_X - INTERNAL_WIDTH * 0.3)

        camera.x = fromX + (toX - fromX) * ease
        camera.clamp()
    }
}