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

const BIRD_COLORS = { red: [200, 40, 40], blue: [40, 100, 200], yellow: [220, 180, 0], black: [40, 40, 40] }

export class RenderSystem {

    render(world, state, camera, buffer, assets) {
        this._drawBackground(buffer)
        this._drawGround(world, camera, buffer)
        this._drawBlocks(world, camera, buffer)
        this._drawPigs(world, camera, buffer)
        this._drawQueue(world, camera, buffer, assets)
        this._drawSlingshot(world, camera, buffer)
        this._drawActiveBird(world, camera, buffer, assets)
        this._drawImpactParticles(world, camera, buffer, assets)
        this._drawTrail(world, camera, buffer)
        this._drawHUD(world, state, buffer)
    }

    _drawBackground(buffer) {
        buffer.background(135, 206, 235)  // cielo azul
    }

    _drawGround(world, camera, buffer) {
        const sy = world.groundY - camera.y
        buffer.noStroke()
        buffer.fill(80, 140, 60)
        buffer.rect(0, sy, INTERNAL_WIDTH, INTERNAL_HEIGHT - sy)
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

    _drawPigs(world, camera, buffer) {
        for (const pig of world.pigs) {
            const { x, y } = pig.body.position
            const sx = x - camera.x
            const sy = y - camera.y
            const r = pig.config.radius

            if (sx + r < 0 || sx - r > INTERNAL_WIDTH) continue

            buffer.fill(60, 180, 60)
            buffer.stroke(0)
            buffer.strokeWeight(0.5)
            buffer.circle(sx, sy, r * 2)
        }
    }

    _drawSlingshot(world, camera, buffer) {
        const { x, y } = world.slingshot
        const sx = x - camera.x
        const sy = y - camera.y

        buffer.stroke(100, 60, 20)
        buffer.strokeWeight(2)
        buffer.line(sx, sy, sx, world.groundY - camera.y)  // palo al suelo

        const bird = world.activeBird
        if (bird && !bird.launched) {
            const bx = bird.x - camera.x
            const by = bird.y - camera.y
            buffer.stroke(180, 140, 40)
            buffer.strokeWeight(1)
            buffer.line(sx, sy, bx, by)
        }
    }

    _drawActiveBird(world, camera, buffer, assets) {
        const bird = world.activeBird
        if (!bird) return

        const x = bird.launched ? bird.body.position.x : bird.x
        const y = bird.launched ? bird.body.position.y : bird.y
        const sx = Math.round(x - camera.x)
        const sy = Math.round(y - camera.y)

        if (drawBirdSprite(buffer, assets, bird, sx, sy, world.time)) return

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

    _drawQueue(world, camera, buffer, assets) {
        for (const bird of world.birds) {
            if (bird.queueX === undefined) continue

            const half = birdSpriteHalf(bird)
            const sx = Math.round(bird.queueX - camera.x)
            const sy = Math.round(bird.queueY - camera.y)

            if (sx + half < 0 || sx - half > INTERNAL_WIDTH) continue

            if (drawBirdSprite(buffer, assets, bird, sx, sy, world.time)) continue

            this._drawBirdCircle(buffer, bird, sx, sy)
        }
    }
    // ── HUD ───────────────────────────────────────────────────

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