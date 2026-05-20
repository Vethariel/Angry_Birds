// systems/birdSystem.js
import {
    SLING_POWER,
    WORLD_WIDTH,
    GROUND_Y,
    BIRD_SETTLE_MIN_TIME,
    BIRD_SETTLE_MAX_TIME,
    BIRD_SETTLE_STOP_SPEED,
    BIRD_SETTLE_STOP_HOLD,
    BIRD_SETTLE_CLEAR_DIST,
} from "../config/constants.js"

const { Body, World: MatterWorld } = Matter

export class BirdSystem {

    update(world, state, command, dt) {

        if (state.name === 'AIMING') {
            this._activateIfNeeded(world)
        }

        if (state.name === 'PULLING') {
            this._updatePullPosition(world)
        }

        if (state.name === 'IN_FLIGHT') {
            world.nextBirdLoaded = false
            this._updateTrail(world)
            this._alignFlightFacing(world)
            this._checkSettled(world, dt)
        }

        if (command?.type === 'RELEASE') {
            this._launch(world, command.pullVector)
        }

        if (command?.type === 'USE_ABILITY') {
            this._useAbility(world)
        }
    }

    /** Quita el pájaro lanzado del mundo (tras IMPACT_EVAL). */
    retireLaunchedBird(world) {
        const bird = world.activeBird
        if (!bird?.launched) return
        MatterWorld.remove(world.matterWorld, bird.body)
        world.activeBird = null
    }

    _activateIfNeeded(world) {
        if (world.activeBird) return
        if (world.pigs.length === 0) return
        if (world.birds.length === 0) return

        const bird = world.birds.shift()
        world.activeBird = bird

        bird.x = world.slingshot.x
        bird.y = world.slingshot.y
    }

    _updatePullPosition(world) {
        const bird = world.activeBird
        if (!bird || !world.pullVector) return

        bird.x = world.slingshot.x + world.pullVector.x
        bird.y = world.slingshot.y + world.pullVector.y
    }

    _launch(world, pullVector) {
        const bird = world.activeBird
        if (!bird || bird.launched) return

        const lx = world.slingshot.x + pullVector.x
        const ly = world.slingshot.y + pullVector.y

        Body.setPosition(bird.body, { x: lx, y: ly })
        bird.body.positionPrev = { x: lx, y: ly }

        const vx = -pullVector.x * SLING_POWER
        const vy = -pullVector.y * SLING_POWER
        Body.setVelocity(bird.body, { x: vx, y: vy })
        const launchAngle = Math.atan2(vy, vx)
        Body.setAngle(bird.body, launchAngle)
        bird.body.anglePrev = launchAngle

        MatterWorld.add(world.matterWorld, bird.body)

        bird.launched = true
        bird.dead = false
        bird.hurt = false
        bird.flightTimer = 0
        bird.stopTimer = 0
        const launchDeg = (launchAngle * 180) / Math.PI
        const a = ((launchDeg % 360) + 360) % 360
        bird.spriteRotation = Math.floor(a / 90) * 90
        world.pullVector = null
    }

    /** Match body angle to flight direction; stop Matter tumble on the circle. */
    _alignFlightFacing(world) {
        const bird = world.activeBird
        if (!bird?.launched || bird.dead) return

        const v = bird.body.velocity
        const speed = Math.hypot(v.x, v.y)
        if (speed < 0.4) return

        const angle = Math.atan2(v.y, v.x)
        Body.setAngle(bird.body, angle)
        Body.setAngularVelocity(bird.body, 0)
    }

    _useAbility(world) {
        const bird = world.activeBird
        if (!bird || bird.abilityUsed || !bird.config.hasAbility) return
        bird.abilityUsed = true
    }

    _updateTrail(world) {
        const bird = world.activeBird
        if (!bird?.launched) return

        const { x, y } = bird.body.position
        bird.trail.push({ x, y })
        if (bird.trail.length > 60) bird.trail.shift()
    }

    _checkSettled(world, dt) {
        const bird = world.activeBird
        if (!bird?.launched || bird.dead) return

        bird.flightTimer = (bird.flightTimer ?? 0) + dt
        if (bird.flightTimer < BIRD_SETTLE_MIN_TIME) return

        const pos = bird.body.position
        const v = bird.body.velocity
        const speed = Math.sqrt(v.x * v.x + v.y * v.y)

        const out = pos.x > WORLD_WIDTH + 50 || pos.x < -50 || pos.y > GROUND_Y + 120
        if (out) {
            this._markBirdLanded(bird)
            return
        }

        if (bird.flightTimer >= BIRD_SETTLE_MAX_TIME) {
            this._markBirdLanded(bird)
            return
        }

        if (this._distToStructures(world, pos.x, pos.y) >= BIRD_SETTLE_CLEAR_DIST) {
            this._markBirdLanded(bird)
            return
        }

        if (speed < BIRD_SETTLE_STOP_SPEED) {
            bird.stopTimer = (bird.stopTimer ?? 0) + dt
            if (bird.stopTimer >= BIRD_SETTLE_STOP_HOLD) {
                this._markBirdLanded(bird)
            }
        } else {
            bird.stopTimer = 0
        }
    }

    _distToStructures(world, bx, by) {
        let min = Infinity

        for (const block of world.blocks) {
            const p = block.body.position
            const dx = Math.max(Math.abs(bx - p.x) - block.w * 0.5, 0)
            const dy = Math.max(Math.abs(by - p.y) - block.h * 0.5, 0)
            min = Math.min(min, Math.hypot(dx, dy))
        }

        for (const pig of world.pigs) {
            const p = pig.body.position
            const r = pig.config.radius
            const d = Math.hypot(bx - p.x, by - p.y) - r
            min = Math.min(min, Math.max(d, 0))
        }

        return min
    }

    _markBirdLanded(bird) {
        bird.dead = true
        bird.hurt = true
    }
}
