// systems/physicsSystem.js
const { Engine, World: MatterWorld, Events } = Matter

export class PhysicsSystem {

    constructor() {
        this._collisionHandler = null
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

    addBody(world, body) {
        MatterWorld.add(world.matterWorld, body)
    }

    removeBody(world, body) {
        MatterWorld.remove(world.matterWorld, body)
    }

    _onCollision(event, world) {
        for (const pair of event.pairs) {
            const { bodyA, bodyB } = pair

            // velocidad relativa como proxy de impacto
            const dvx = bodyA.velocity.x - bodyB.velocity.x
            const dvy = bodyA.velocity.y - bodyB.velocity.y
            const impulse = Math.sqrt(dvx * dvx + dvy * dvy)

            const entityA = bodyA.gameEntity
            const entityB = bodyB.gameEntity

            entityA?.onHit?.(impulse, entityB)
            entityB?.onHit?.(impulse, entityA)
        }
    }
}