// systems/birdSystem.js
import { SLING_POWER, WORLD_WIDTH, GROUND_Y } from "../config/constants.js"

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
            this._updateTrail(world)
            this._checkLanded(world, dt)
        }

        if (command?.type === 'RELEASE') {
            this._launch(world, command.pullVector)
        }

        if (command?.type === 'USE_ABILITY') {
            this._useAbility(world)
        }
    }

    _activateIfNeeded(world) {
        if (world.activeBird) return
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
        console.log('pullVector:', pullVector)  // ← ver qué llega
        console.log('SLING_POWER:', SLING_POWER)
        const bird = world.activeBird
        if (!bird || bird.launched) return

        const lx = world.slingshot.x + pullVector.x
        const ly = world.slingshot.y + pullVector.y

        // recién acá entra a Matter con estado limpio
        Body.setPosition(bird.body, { x: lx, y: ly })
        bird.body.positionPrev = { x: lx, y: ly }
        bird.body.anglePrev = 0

        Body.setVelocity(bird.body, {
            x: -pullVector.x * SLING_POWER,
            y: -pullVector.y * SLING_POWER,
        })

        MatterWorld.add(world.matterWorld, bird.body)

        bird.launched = true
        bird.flightTimer = 0
        world.pullVector = null

        console.log('LAUNCH:', {
            velocity: bird.body.velocity,
            position: bird.body.position,
            isStatic: bird.body.isStatic,
        })
    }

    _useAbility(world) {
        const bird = world.activeBird
        if (!bird || bird.abilityUsed || !bird.config.hasAbility) return
        bird.abilityUsed = true
        // AbilitySystem lo ejecutará después
    }

    _updateTrail(world) {
        const bird = world.activeBird
        if (!bird || bird.dead) return

        const { x, y } = bird.body.position
        bird.trail.push({ x, y })
        if (bird.trail.length > 60) bird.trail.shift()
    }

    _checkLanded(world, dt) {
        const bird = world.activeBird
        if (!bird) return

        bird.flightTimer = (bird.flightTimer ?? 0) + dt

        console.log('velocity raw:', bird.body.velocity)
        console.log('activeBird:', world.activeBird)
        console.log('body:', world.activeBird?.body)

        const v = bird.body.velocity
        const speed = Math.sqrt(v.x * v.x + v.y * v.y)
        const pos = bird.body.position

        // log cada 10 frames aprox
        if (Math.random() < 0.05) {
            console.log('IN_FLIGHT:', {
                speed: speed.toFixed(2),
                pos: { x: pos.x.toFixed(0), y: pos.y.toFixed(0) },
                timer: bird.flightTimer.toFixed(2),
                dead: bird.dead,
            })
        }

        if (bird.flightTimer < 0.3) return

        const out = pos.x > WORLD_WIDTH || pos.x < 0 || pos.y > GROUND_Y + 100
        if (speed < 0.5 || out) {
            console.log('BIRD DEAD — reason:', speed < 0.5 ? 'speed' : 'out of bounds', { speed, pos })
            bird.dead = true
        }
    }
}