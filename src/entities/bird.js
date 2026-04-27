// entities/bird.js
import { BIRD_TYPES } from "../config/entityConfig.js"

const { Bodies, Body } = Matter

export class Bird {
    constructor(type) {
        this.type        = type
        this.config      = BIRD_TYPES[type]
        this.launched    = false
        this.dead        = false
        this.abilityUsed = false
        this.trail       = []
        this.body = Bodies.circle(0,0, this.config.radius, {
            restitution:     this.config.restitution,
            collisionFilter: { category: 0x0002 },
            label:           'bird',
        })
        Body.setMass(this.body, this.config.mass)
        this.body.gameEntity = this
    }
}