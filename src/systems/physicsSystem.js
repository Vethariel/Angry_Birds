// systems/physicsSystem.js
import { BIRD_HIGH_IMPACT_IMPULSE } from "../config/birdSpriteConfig.js"
import { spawnImpactParticles } from "../render/birdSpriteRenderer.js"

const { Engine, World: MatterWorld, Events } = Matter

export class PhysicsSystem {

    constructor() {
        this._collisionHandler = null
        this.damageEvents = []
    }

    // Se llama al entrar al nivel — registra el listener en el engine del world
    mount(world) {
        this._collisionHandler = (e) => this._onCollision(e, world)
        this._world = world
        Events.on(world.engine, 'collisionStart', this._collisionHandler)
    }

    // Se llama al salir del nivel — limpia el listener
    unmount(world) {
        if (this._collisionHandler) {
            Events.off(world.engine, 'collisionStart', this._collisionHandler)
            this._collisionHandler = null
        }
        this._world = null
    }

    update(world, dt) {
        Engine.update(world.engine, dt * 1000)
    }

    flushDamageEvents() {
        const events = this.damageEvents
        this.damageEvents = []
        return events
    }

    addBody(world, body) {
        MatterWorld.add(world.matterWorld, body)
    }

    removeBody(world, body) {
        MatterWorld.remove(world.matterWorld, body)
    }

    /** Blocks, pigs, and launched bird — all below speed/angular limits. */
    isWorldStable(world, maxSpeed, maxAngular = 0.08) {
        const bodies = []

        for (const block of world.blocks) bodies.push(block.body)
        for (const pig of world.pigs) bodies.push(pig.body)

        const bird = world.activeBird
        if (bird?.launched && bird.body) bodies.push(bird.body)

        if (bodies.length === 0) return true

        for (const body of bodies) {
            const v = body.velocity
            const speed = Math.sqrt(v.x * v.x + v.y * v.y)
            if (speed > maxSpeed) return false
            if (Math.abs(body.angularVelocity) > maxAngular) return false
        }

        return true
    }

    _onCollision(event) {
        const world = this._world
        for (const pair of event.pairs) {
            const { bodyA, bodyB } = pair

            const dvx = bodyA.velocity.x - bodyB.velocity.x
            const dvy = bodyA.velocity.y - bodyB.velocity.y
            const impulse = Math.sqrt(dvx * dvx + dvy * dvy)

            const entityA = bodyA.gameEntity
            const entityB = bodyB.gameEntity

            if (world) {
                this._maybeSpawnBirdImpact(world, entityA, entityB, impulse)
            }

            if (entityA || entityB) {
                this.damageEvents.push({ entityA, entityB, impulse })
            }
        }
    }

    _maybeSpawnBirdImpact(world, entityA, entityB, impulse) {
        if (impulse < BIRD_HIGH_IMPACT_IMPULSE) return

        let bird = null
        let otherBody = null
        if (entityA?.launched) {
            bird = entityA
            otherBody = entityB
        } else if (entityB?.launched) {
            bird = entityB
            otherBody = entityA
        }
        if (!bird || bird.type !== "red") return

        const bp = bird.body.position
        let x = bp.x
        let y = bp.y
        if (otherBody?.position) {
            x = (bp.x + otherBody.position.x) * 0.5
            y = (bp.y + otherBody.position.y) * 0.5
        }

        spawnImpactParticles(world, x, y, bird.type)
    }
}