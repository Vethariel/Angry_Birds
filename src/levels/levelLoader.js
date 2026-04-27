// levels/levelLoader.js
import { Bird } from "../entities/bird.js"
import { Pig } from "../entities/pig.js"
import { Block } from "../entities/block.js"
import {
    WORLD_WIDTH,
    GROUND_Y,
    SLINGSHOT_X,
    SLINGSHOT_HEIGHT,
    LEVEL_ORIGIN_X,
} from "../config/constants.js"

import { PIG_TYPES } from "../config/entityConfig.js"

const { Bodies, Body, World: MatterWorld } = Matter

export class LevelLoader {

    load(levelData, world) {

        world.groundY = GROUND_Y
        world.cameraY = levelData.cameraY ?? 0

        // ── Suelo ─────────────────────────────────────────────
        const ground = Bodies.rectangle(
            WORLD_WIDTH / 2,
            GROUND_Y + 10,        // centro del rect de 20px
            WORLD_WIDTH, 20,
            { isStatic: true, label: 'ground', friction: 0.8 }
        )
        MatterWorld.add(world.matterWorld, ground)

        // ── Slingshot ─────────────────────────────────────────
        world.slingshot = {
            x: SLINGSHOT_X,
            y: GROUND_Y - SLINGSHOT_HEIGHT,          // la punta de la trinchera está al nivel del suelo
        }

        // ── Pájaros ───────────────────────────────────────────
        for (const birdType of levelData.birds) {
            const bird = new Bird(birdType)
            world.birds.push(bird)
        }

        // ── Cerdos ────────────────────────────────────────────
        for (const pigDef of levelData.pigs) {
            const wx = LEVEL_ORIGIN_X + pigDef.x
            const wy = GROUND_Y - pigDef.y - PIG_TYPES[pigDef.type].radius

            const pig = new Pig(pigDef.type, wx, wy)  // ← coordenadas finales
            MatterWorld.add(world.matterWorld, pig.body)
            world.pigs.push(pig)
        }

        // ── Bloques ───────────────────────────────────────────
        // levels/levelLoader.js — bloques
        for (const blockDef of levelData.blocks) {
            const w = blockDef.x2 - blockDef.x1
            const h = blockDef.y2 - blockDef.y1
            const wx = LEVEL_ORIGIN_X + blockDef.x1 + w / 2
            const wy = GROUND_Y - blockDef.y1 - h / 2

            const block = new Block(blockDef.type, wx, wy, w, h)  // ← coordenadas finales
            MatterWorld.add(world.matterWorld, block.body)
            world.blocks.push(block)
        }

    }
}