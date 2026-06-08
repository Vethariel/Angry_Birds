// systems/damageSystem.js

import { spawnScorePopup } from "../render/scorePopupRenderer.js"

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

        if (impulse < receiver.config.damageThresh) return

        const attackerDamage = other?.body?.label === 'bird'
            ? other.config.damage
            : 0

        const damage = impulse * 4 + attackerDamage
        receiver.hp -= damage

        if (receiver.hp > 0 && label === 'pig') {
            receiver.hurt = true
        }

        if (receiver.hp <= 0) {
            receiver.dead = true
            if (label === 'pig') {
                receiver.deathX = receiver.body.position.x
                receiver.deathY = receiver.body.position.y
                receiver.deathFrame = 0
                receiver.deathTimer = 0
                receiver.deathAnimDone = false
                spawnScorePopup(world, receiver.deathX, receiver.deathY, receiver.config.score)
                world.score += receiver.config.score
            }
        }
    }

    _removeDeadEntities(world) {
        for (const pig of world.pigs) {
            if (!pig.dead) continue

            if (!pig.bodyRemoved && pig.body) {
                MatterWorld.remove(world.matterWorld, pig.body)
                pig.bodyRemoved = true
                pig.body = null
            }
        }

        world.pigs = world.pigs.filter(p => !p.dead || !p.deathAnimDone)

        for (const block of world.blocks) {
            if (block.dead) {
                MatterWorld.remove(world.matterWorld, block.body)
                world.score += block.config.score
            }
        }

        world.blocks = world.blocks.filter(b => !b.dead)
    }
}