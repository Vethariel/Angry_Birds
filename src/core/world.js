// core/world.js
const { Engine, World: MatterWorld } = Matter

export class World {

    constructor() {
        this.engine      = Engine.create({ gravity: { y: 0.25 } })
        this.matterWorld = this.engine.world

        this.birds      = []
        this.pigs       = []
        this.blocks     = []
        this.slingshot  = null
        this.activeBird = null

        this.score    = 0
        this.gameWon  = false
        this.gameOver = false

        this.slingConstraint = null
        this.nextBirdLoaded  = true

        this.time = 0
        this.impactParticles = []
    }

    load(levelData) {
        MatterWorld.clear(this.matterWorld)
        Engine.clear(this.engine)

        this.birds      = []
        this.pigs       = []
        this.blocks     = []
        this.activeBird = null
        this.score      = 0
        this.gameWon    = false
        this.gameOver   = false
        this.time = 0
        this.impactParticles = []

        // GameplayScene o un LevelLoader construye las entidades
        // y las mete en estas listas + en matterWorld
    }

}