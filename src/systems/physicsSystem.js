// systems/physicsSystem.js
const { Engine, World: MatterWorld, Events } = Matter

export class PhysicsSystem {

    constructor() {
        this._collisionHandler = null
        this.damageEvents = []
    }

    // Se llama al entrar al nivel — registra el listener en el engine del world
    mount(world) {
        this._collisionHandler = (e) => this._onCollision(e, world)
        Events.on(world.engine, 'collisionStart', this._collisionHandler)
    }

    // Se llama al salir del nivel — limpia el listener
    unmount(world) {
        if (this._collisionHandler) {
            Events.off(world.engine, 'collisionStart', this._collisionHandler)
            this._collisionHandler = null
        }
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

    _onCollision(event) {
        for (const pair of event.pairs) {
            const { bodyA, bodyB } = pair

            const dvx = bodyA.velocity.x - bodyB.velocity.x
            const dvy = bodyA.velocity.y - bodyB.velocity.y
            const impulse = Math.sqrt(dvx * dvx + dvy * dvy)

            const entityA = bodyA.gameEntity
            const entityB = bodyB.gameEntity

            // solo emite si al menos una entidad es relevante
            if (entityA || entityB) {
                this.damageEvents.push({ entityA, entityB, impulse })
            }
        }
    }
}