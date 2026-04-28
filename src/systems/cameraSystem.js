// systems/cameraSystem.js
import { SLINGSHOT_X, INTERNAL_WIDTH, LEVEL_ORIGIN_X } from "../config/constants.js"

export class CameraSystem {

    update(world, state, camera, dt) {

        if (state.name === 'INTRO_PAN') {
            this._updateIntroPan(state, camera, dt)
        }

        if (state.name === 'IN_FLIGHT') {
            this._updateFollow(world, camera)
        }

        if (state.name === 'IMPACT_EVAL') {
            this._updateSettle(camera, dt)
        }

        if (state.name === 'RETURN_TO_SLING') {
            this._updateReturnToSlingshot(camera)
        }
    }

    _updateIntroPan(state, camera, dt) {

        const PAUSE = 1.5   // segundos mostrando la tercera pantalla
        const TRAVEL = 1.0   // segundos viajando a la honda

        if (state.timer < PAUSE) {
            // cámara quieta en la tercera pantalla
            camera.x = LEVEL_ORIGIN_X
            camera.clamp()
            return
        }

        // viaje de tercera pantalla → honda
        const t = Math.min((state.timer - PAUSE) / TRAVEL, 1)
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

        const fromX = LEVEL_ORIGIN_X
        const toX = Math.max(0, SLINGSHOT_X - INTERNAL_WIDTH * 0.3)

        camera.x = fromX + (toX - fromX) * ease
        camera.clamp()
    }

    _updateFollow(world, camera) {
        const bird = world.activeBird
        if (!bird || !bird.launched) return

        const birdX = bird.body.position.x

        // mantener el pájaro en el tercio izquierdo del viewport
        const targetX = birdX - INTERNAL_WIDTH * 0.3

        // lerp suave para que la cámara no sea instantánea
        camera.x += (targetX - camera.x) * 0.08
        camera.clamp()
    }

    _updateSettle(camera, dt) {
        // al impactar, la cámara termina de moverse a la tercera pantalla
        const targetX = LEVEL_ORIGIN_X
        camera.x += (targetX - camera.x) * 0.05
        camera.clamp()
    }

    _updateReturnToSlingshot(camera) {
        const targetX = Math.max(0, SLINGSHOT_X - INTERNAL_WIDTH * 0.3)
        camera.x += (targetX - camera.x) * 0.06
    }
}