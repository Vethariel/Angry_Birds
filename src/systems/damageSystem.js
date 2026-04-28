// systems/damageSystem.js
import { BIRD_TYPES } from "../config/entityConfig.js"

const { World: MatterWorld } = Matter

export class DamageSystem {

    update(world, physicsSystem) {
        const events = physicsSystem.flushDamageEvents()

        for (const { entityA, entityB, impulse } of events) {
            this._applyDamage(entityA, entityB, impulse, world)
            this._applyDamage(entityB, entityA, impulse, world)
        }

        this._removeDeadEntities(world)
    }

    _applyDamage(receiver, other, impulse, world) {
        if (!receiver) return
        if (receiver.launched === true) return   // el pájaro no recibe daño
        if (receiver.dead) return

        const label = receiver.body?.label
        if (label !== 'pig' && label !== 'block') return

        console.log('HIT:', {
            label,
            impulse: impulse.toFixed(2),
            thresh: receiver.config.damageThresh,
            hp: receiver.hp?.toFixed(1),
        })

        // umbral mínimo de impulso para recibir daño
        if (impulse < receiver.config.damageThresh) {
            console.log('  → debajo del umbral, sin daño')
            return
        }

        // daño base del impulso + daño del atacante si es pájaro
        const attackerDamage = other?.body?.label === 'bird'
            ? other.config.damage
            : 0

        const damage = impulse * 4 + attackerDamage
        receiver.hp -= damage

        console.log('  → daño aplicado:', damage.toFixed(2), '| HP restante:', (receiver.hp - damage).toFixed(1))


        if (receiver.hp <= 0) {
            receiver.dead = true
        }
    }

    _removeDeadEntities(world) {
        for (const pig of world.pigs) {
            if (pig.dead) {
                MatterWorld.remove(world.matterWorld, pig.body)
                world.score += pig.config.score
            }
        }
        for (const block of world.blocks) {
            if (block.dead) {
                MatterWorld.remove(world.matterWorld, block.body)
                world.score += block.config.score
            }
        }

        world.pigs = world.pigs.filter(p => !p.dead)
        world.blocks = world.blocks.filter(b => !b.dead)
    }
}