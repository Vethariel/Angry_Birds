// entities/pig.js
import { PIG_TYPES } from "../config/entityConfig.js"

const { Bodies } = Matter

export class Pig {
    constructor(type, x, y) {
        this.type   = type
        this.config = PIG_TYPES[type]
        this.hp     = this.config.hp
        this.dead   = false
        this.hurt   = false
        this.facingDeg = 0
        this.deathFrame = 0
        this.deathTimer = 0
        this.deathAnimDone = false
        this.bodyRemoved = false
        this.deathX = x
        this.deathY = y

        this.body = Bodies.circle(x, y, this.config.radius, {
            restitution:     0.3,
            collisionFilter: { category: 0x0004 },
            label:           'pig',
        })
        this.body.gameEntity = this
    }
}
