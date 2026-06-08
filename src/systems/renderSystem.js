// systems/renderSystem.js
import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../config/constants.js"
import { BLOCK_PALETTES, blockDamageTier } from "../config/blockPalette.js"
import {
    blockCornersToScreen,
    rasterizeBlock,
    vertsOnScreen,
} from "../render/blockPixelRenderer.js"
import {
    drawBirdSprite,
    drawImpactParticles,
    birdSpriteHalf,
} from "../render/birdSpriteRenderer.js"
import { drawPigSprite, pigSpriteHalf } from "../render/pigSpriteRenderer.js"
import { drawParallaxBackground } from "../render/backgroundParallax.js"
import {
    drawGroundUnderground,
    drawGroundTallGrass,
    drawGroundShortGrass,
} from "../render/groundParallax.js"
import {
    drawSlingshotBack,
    drawSlingshotFront,
    drawSlingshotBandBack,
    drawSlingshotSeat,
    drawSlingshotBandFront,
} from "../render/slingshotRenderer.js"
import { drawScorePopups } from "../render/scorePopupRenderer.js"
import { getCelebrationWorldPos } from "../render/victoryCelebration.js"

const BIRD_COLORS = { red: [200, 40, 40], blue: [40, 100, 200], yellow: [220, 180, 0], black: [40, 40, 40] }

function birdWorldPos(bird, world, state) {
    const celebrate = state?.name === "VICTORY_CELEBRATION" && getCelebrationWorldPos(bird)
    if (celebrate) return celebrate

    if (world.activeBird === bird && !bird.launched) {
        return { x: bird.x, y: bird.y }
    }
    if (bird.queueX !== undefined) {
        return { x: bird.queueX, y: bird.queueY }
    }
    return { x: bird.x, y: bird.y }
}

export class RenderSystem {

    render(world, state, camera, buffer, assets) {
        this._drawBackground(world, camera, buffer, assets)
        this._drawGroundUnderground(world, camera, buffer, assets)
        this._drawGroundTallGrass(world, camera, buffer, assets)
        this._drawBlocks(world, camera, buffer)
        this._drawPigs(world, camera, buffer, assets)
        this._drawQueue(world, state, camera, buffer, assets)
        this._drawSlingshotBack(world, camera, buffer, assets)
        this._drawSlingshotBandBack(world, camera, buffer, state?.name)
        this._drawActiveBird(world, state, camera, buffer, assets)
        this._drawSlingshotSeat(world, camera, buffer, state?.name)
        this._drawSlingshotBandFront(world, camera, buffer, state?.name)
        this._drawSlingshotFront(world, camera, buffer, assets)
        this._drawImpactParticles(world, camera, buffer, assets)
        this._drawTrail(world, camera, buffer)
        this._drawGroundShortGrass(world, camera, buffer, assets)
        this._drawScorePopups(world, camera, buffer)
        this._drawHUD(world, state, buffer)
    }

    _drawBackground(world, camera, buffer, assets) {
        drawParallaxBackground(buffer, assets, world, camera)
    }

    _drawGroundUnderground(world, camera, buffer, assets) {
        drawGroundUnderground(buffer, assets, world, camera)
    }

    _drawGroundTallGrass(world, camera, buffer, assets) {
        drawGroundTallGrass(buffer, assets, world, camera)
    }

    _drawGroundShortGrass(world, camera, buffer, assets) {
        drawGroundShortGrass(buffer, assets, world, camera)
    }

    _drawBlocks(world, camera, buffer) {
        buffer.loadPixels()

        const pixels = buffer.pixels
        const bufW = buffer.width
        const bufH = buffer.height

        for (const block of world.blocks) {
            const palette = BLOCK_PALETTES[block.type]
            if (!palette) continue

            const screenVerts = blockCornersToScreen(block.body, block.w, block.h, camera)
            if (!vertsOnScreen(screenVerts, INTERNAL_WIDTH)) continue

            const tier = blockDamageTier(block.hp, block.config.hp)
            rasterizeBlock(pixels, bufW, bufH, screenVerts, palette, tier)
        }

        buffer.updatePixels()
    }

    _drawPigs(world, camera, buffer, assets) {
        for (const pig of world.pigs) {
            const x = pig.body?.position.x ?? pig.deathX
            const y = pig.body?.position.y ?? pig.deathY
            const sx = Math.round(x - camera.x)
            const sy = Math.round(y - camera.y)
            const half = pigSpriteHalf(pig)

            if (sx + half < 0 || sx - half > INTERNAL_WIDTH) continue

            if (drawPigSprite(buffer, assets, pig, sx, sy, world.time)) continue

            const r = pig.config.radius
            buffer.fill(60, 180, 60)
            buffer.stroke(0)
            buffer.strokeWeight(0.5)
            buffer.circle(sx, sy, r * 2)
        }
    }

    _drawSlingshotBack(world, camera, buffer, assets) {
        drawSlingshotBack(buffer, assets, world, camera)
    }

    _drawSlingshotBandBack(world, camera, buffer, phase) {
        drawSlingshotBandBack(buffer, world, camera, phase)
    }

    _drawSlingshotSeat(world, camera, buffer, phase) {
        drawSlingshotSeat(buffer, world, camera, phase)
    }

    _drawSlingshotBandFront(world, camera, buffer, phase) {
        drawSlingshotBandFront(buffer, world, camera, phase)
    }

    _drawSlingshotFront(world, camera, buffer, assets) {
        drawSlingshotFront(buffer, assets, world, camera)
    }

    _drawActiveBird(world, state, camera, buffer, assets) {
        const bird = world.activeBird
        if (!bird) return

        const { x, y } = bird.launched
            ? { x: bird.body.position.x, y: bird.body.position.y }
            : birdWorldPos(bird, world, state)
        const sx = Math.round(x - camera.x)
        const sy = Math.round(y - camera.y)

        if (drawBirdSprite(buffer, assets, bird, sx, sy, world.time, state?.name, world)) return

        this._drawBirdCircle(buffer, bird, sx, sy)
    }

    _drawImpactParticles(world, camera, buffer, assets) {
        drawImpactParticles(buffer, assets, world, camera)
    }

    _drawBirdCircle(buffer, bird, sx, sy) {
        const r = bird.config.radius
        const [cr, cg, cb] = BIRD_COLORS[bird.type] ?? [200, 40, 40]
        buffer.fill(cr, cg, cb)
        buffer.stroke(0)
        buffer.strokeWeight(0.5)
        buffer.circle(sx, sy, r * 2)
    }

    _drawTrail(world, camera, buffer) {
        const bird = world.activeBird
        if (!bird?.launched || bird.trail.length < 2) return

        buffer.noFill()
        buffer.stroke(255, 255, 255, 160)
        buffer.strokeWeight(1)
        for (let i = 1; i < bird.trail.length; i++) {
            const a = bird.trail[i - 1]
            const b = bird.trail[i]
            buffer.line(a.x - camera.x, a.y - camera.y, b.x - camera.x, b.y - camera.y)
        }
    }

    _drawQueue(world, state, camera, buffer, assets) {
        for (const bird of world.birds) {
            if (bird.queueX === undefined && bird.victoryBaseX == null) continue

            const { x, y } = birdWorldPos(bird, world, state)
            const half = birdSpriteHalf(bird)
            const sx = Math.round(x - camera.x)
            const sy = Math.round(y - camera.y)

            if (sx + half < 0 || sx - half > INTERNAL_WIDTH) continue

            if (drawBirdSprite(buffer, assets, bird, sx, sy, world.time, state?.name, world)) continue

            this._drawBirdCircle(buffer, bird, sx, sy)
        }
    }
    // ── HUD ───────────────────────────────────────────────────

    _drawScorePopups(world, camera, buffer) {
        drawScorePopups(buffer, world, camera)
    }

    _drawHUD(world, state, buffer) {
        buffer.noStroke()
        buffer.fill(255)
        buffer.textSize(8)
        buffer.textAlign('right', 'bottom')
        buffer.text(`${world.score}`, INTERNAL_WIDTH - 6, 6)

        // estado actual (debug — se quita después)
        buffer.fill(255, 255, 0)
        buffer.textAlign('left', 'top')
        buffer.text(state.name, 6, 6)
    }
}