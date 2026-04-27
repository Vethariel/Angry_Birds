// entities/pig.js
import { PIG_TYPES } from "../config/entityConfig.js"

const { Bodies } = Matter

export class Pig {
    constructor(type, x, y) {
        this.type   = type
        this.config = PIG_TYPES[type]
        this.hp     = this.config.hp
        this.dead   = false

        const { Bodies } = Matter
        this.body = Bodies.circle(x, y, this.config.radius, {
            restitution:     0.3,
            collisionFilter: { category: 0x0004 },
            label:           'pig',
        })
        this.body.gameEntity = this
    }
}