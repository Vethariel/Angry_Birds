// systems/birdSystem.js
import {
    SLING_POWER,
    WORLD_WIDTH,
    GROUND_Y,
    BIRD_SETTLE_MIN_TIME,
    BIRD_SETTLE_MAX_TIME,
    BIRD_SETTLE_STOP_SPEED,
    BIRD_SETTLE_STOP_HOLD,
} from "../config/constants.js"
import {
    beginLaunchReport,
    recordLaunchLanded,
    finalizeLaunchReport,
} from "../debug/flightReport.js"
import {
    BIRD_SLING_ENTER_DURATION,
    BIRD_SLING_ENTER_JUMP,
} from "../config/birdSpriteConfig.js"

const { Body, World: MatterWorld, Collision } = Matter

const SLING_ENTER_FLIP_STEPS = 24

const GROUND_CONTACT_EPS = 3
const GROUND_ROLL_MIN_VX = 0.03
const SURFACE_LEAVE_GRACE = 0.1
const SURFACE_LATCH_MAX_SPEED = 0.7

/** Bird center resting on the world floor (top at GROUND_Y). */
export function isBirdOnGround(bird) {
    if (!bird?.launched || !bird.body) return false
    return bird.body.position.y >= GROUND_Y + bird.config.radius - GROUND_CONTACT_EPS
}

/** Bird sliding on a block top — tight check, not used while falling through the air. */
function isBirdRestingOnBlock(bird, block) {
    const r = bird.config.radius
    const { x, y } = bird.body.position
    const v = bird.body.velocity
    const speed = Math.hypot(v.x, v.y)

    if (speed > SURFACE_LATCH_MAX_SPEED) return false
    if (v.y > 0.5 || v.y < -0.8) return false

    const b = block.body.bounds
    if (x < b.min.x - r * 0.35 || x > b.max.x + r * 0.35) return false

    const bottomY = y + r
    const topY = b.min.y
    return bottomY >= topY - 2 && bottomY <= topY + 3
}

/** Touching floor or any block — includes structures above GROUND_Y. */
export function isBirdOnSurface(bird, world) {
    if (!bird?.launched || !bird.body) return false
    if (isBirdOnGround(bird)) return true

    if (world.groundBody && Collision.collides(bird.body, world.groundBody)) {
        return true
    }

    for (const block of world.blocks) {
        if (Collision.collides(bird.body, block.body)) return true
        if (isBirdRestingOnBlock(bird, block)) return true
    }

    return false
}

export class BirdSystem {

    update(world, state, command, dt) {

        if (state.name === 'AIMING') {
            this._activateIfNeeded(world)
            this._updateSlingEntry(world, dt)
        }

        if (state.name === 'PULLING') {
            this._updatePullPosition(world)
        }

        if (world.activeBird?.launched) {
            this._updateSurfaceState(world, dt)
            this._applyGroundRoll(world)
            this._alignFlightFacing(world)
        }

        if (state.name === 'IN_FLIGHT') {
            world.nextBirdLoaded = false
            this._updateTrail(world)
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
        finalizeLaunchReport(world, "retired")
        MatterWorld.remove(world.matterWorld, bird.body)
        world.activeBird = null
    }

    _activateIfNeeded(world) {
        if (world.activeBird) return
        if (world.pigs.length === 0) return
        if (world.birds.length === 0) return

        const bird = world.birds.shift()
        world.activeBird = bird

        const fromX = bird.queueX ?? world.slingshot.x
        const fromY = bird.queueY ?? world.slingshot.y
        bird.slingEnterFrom = { x: fromX, y: fromY }
        bird.slingEnterT = 0
        bird.slingEnterFacingDeg = 0
        bird.slingReady = false
        bird.x = fromX
        bird.y = fromY
    }

    _updateSlingEntry(world, dt) {
        const bird = world.activeBird
        if (!bird?.launched && bird.slingReady === false) {
            bird.slingEnterT = (bird.slingEnterT ?? 0) + dt / BIRD_SLING_ENTER_DURATION
            const t = Math.min(1, bird.slingEnterT)
            const eased = t * t * (3 - 2 * t)
            const jump = BIRD_SLING_ENTER_JUMP * Math.sin(t * Math.PI)

            const from = bird.slingEnterFrom
            const to = world.slingshot
            bird.x = from.x + (to.x - from.x) * eased
            bird.y = from.y + (to.y - from.y) * eased - jump
            const flipStep = Math.min(SLING_ENTER_FLIP_STEPS - 1, Math.floor(t * SLING_ENTER_FLIP_STEPS))
            bird.slingEnterFacingDeg = flipStep * 15

            if (t >= 1) {
                bird.x = to.x
                bird.y = to.y
                bird.slingEnterFacingDeg = 0
                bird.slingReady = true
            }
        }
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
        bird.onSurface = false
        bird.surfaceLeaveTimer = 0
        bird.facingDeg = (launchAngle * 180) / Math.PI
        bird.flightTimer = 0
        bird.stopTimer = 0
        bird.lastImpactFx = null
        world.pullVector = null

        beginLaunchReport(world, bird, pullVector, vx, vy, world.levelIndex)
    }

    _updateSurfaceState(world, dt) {
        const bird = world.activeBird
        const touching = isBirdOnSurface(bird, world)
        const v = bird.body.velocity
        const speed = Math.hypot(v.x, v.y)

        if (touching) {
            bird.onSurface = true
            bird.surfaceLeaveTimer = 0
            return
        }

        if (!bird.onSurface) return

        // Brief separation during roll — only while nearly stopped, never during the arc.
        if (speed < SURFACE_LATCH_MAX_SPEED && v.y > -0.5 && v.y < 0.5) {
            bird.surfaceLeaveTimer = (bird.surfaceLeaveTimer ?? 0) + dt
            if (bird.surfaceLeaveTimer < SURFACE_LEAVE_GRACE) return
        }

        bird.onSurface = false
        bird.surfaceLeaveTimer = 0
    }

    /** Rolling without slip: ω = vx / r (Matter y-down, clockwise positive). */
    _applyGroundRoll(world) {
        const bird = world.activeBird
        if (!bird?.onSurface) return

        const v = bird.body.velocity
        if (Math.abs(v.y) > 0.8) return
        if (Math.hypot(v.x, v.y) > 2) return

        const vx = v.x
        if (Math.abs(vx) < GROUND_ROLL_MIN_VX) return

        Body.setAngularVelocity(bird.body, vx / bird.config.radius)
    }

    /** Airborne only: align body to velocity. On any surface, roll logic owns rotation. */
    _alignFlightFacing(world) {
        const bird = world.activeBird
        if (!bird?.launched || bird.dead || bird.onSurface) return

        const v = bird.body.velocity
        const speed = Math.hypot(v.x, v.y)
        if (speed < BIRD_SETTLE_STOP_SPEED) return

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
            this._markBirdLanded(bird, world)
            return
        }

        if (bird.flightTimer >= BIRD_SETTLE_MAX_TIME) {
            this._markBirdLanded(bird, world)
            return
        }

        const rolling = Math.abs(v.x) > 0.05 || Math.abs(bird.body.angularVelocity) > 0.04

        if (speed < BIRD_SETTLE_STOP_SPEED && bird.onSurface && !rolling) {
            bird.stopTimer = (bird.stopTimer ?? 0) + dt
            if (bird.stopTimer >= BIRD_SETTLE_STOP_HOLD) {
                this._markBirdLanded(bird, world)
            }
        } else {
            bird.stopTimer = 0
        }
    }

    _markBirdLanded(bird, world) {
        if (!bird.onSurface) {
            if (bird.facingDeg != null) {
                Body.setAngle(bird.body, (bird.facingDeg * Math.PI) / 180)
            }
            Body.setAngularVelocity(bird.body, 0)
        }
        bird.dead = true
        bird.hurt = true
        recordLaunchLanded(world)
    }
}
