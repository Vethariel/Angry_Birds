// entities/block.js
import { BLOCK_TYPES } from "../config/entityConfig.js"

const { Bodies } = Matter

// entities/block.js
export class Block {
    constructor(type, x, y, w, h) {
        this.type   = type
        this.config = BLOCK_TYPES[type]
        this.w      = w
        this.h      = h
        this.hp     = this.config.hp
        this.dead   = false

        const { Bodies } = Matter
        this.body = Bodies.rectangle(x, y, w, h, {  // ← posición final directo
            density:     this.config.density,
            restitution: this.config.restitution,
            friction:    this.config.friction,
            label:       'block',
        })
        this.body.gameEntity = this
    }
}