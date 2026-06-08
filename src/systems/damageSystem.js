// systems/damageSystem.js

import { spawnScorePopup } from "../render/scorePopupRenderer.js"
import { PIG_BIRD_IMPULSE_MULT } from "../config/entityConfig.js"

const { World: MatterWorld } = Matter

function isBirdHit(other) {
    return other?.body?.label === "bird" || other?.launched === true
}

function computeDamage(receiver, other, impulse) {
    const label = receiver.body?.label

    if (label === "pig" && !isBirdHit(other)) {
        const mult = receiver.config.fallImpulseMult ?? 8
        return impulse * mult
    }

    const birdBonus = isBirdHit(other) ? other.config.damage : 0
    return impulse * PIG_BIRD_IMPULSE_MULT + birdBonus
}

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

        if (label === "pig" && !isBirdHit(other) && !world.firstBirdLaunched) return

        const damage = computeDamage(receiver, other, impulse)
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