// systems/renderSystem.js
import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../config/constants.js"

const STATE = {
    INTRO_PAN: 'INTRO_PAN',
    AIMING: 'AIMING',
    PAN_DRAG: 'PAN_DRAG',
    PULLING: 'PULLING',
    IN_FLIGHT: 'IN_FLIGHT',
    IMPACT_EVAL: 'IMPACT_EVAL',
    SCORE_TALLY: 'SCORE_TALLY',
}

// Colores por material de bloque
const BLOCK_COLORS = {
    wood: '#8B5E3C',
    ice: '#A8D8EA',
    stone: '#888888',
}

const BIRD_COLORS = { red: [200, 40, 40], blue: [40, 100, 200], yellow: [220, 180, 0], black: [40, 40, 40] }

const COLORS = { wood: [139, 94, 60], ice: [168, 216, 234], stone: [136, 136, 136] }

export class RenderSystem {

    render(world, state, camera, buffer) {
        this._drawBackground(buffer)
        this._drawGround(world, camera, buffer)
        this._drawBlocks(world, camera, buffer)
        this._drawPigs(world, camera, buffer)
        this._drawSlingshot(world, camera, buffer)
        this._drawActiveBird(world, camera, buffer)
        this._drawTrail(world, camera, buffer)
        this._drawQueue(world, buffer)
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



        for (const block of world.blocks) {
            const { x, y } = block.body.position
            const sx = x - camera.x
            const sy = y - camera.y

            if (sx + block.w / 2 < 0 || sx - block.w / 2 > INTERNAL_WIDTH) continue

            const [r, g, b] = COLORS[block.type] ?? [128, 128, 128]
            buffer.fill(r, g, b)
            buffer.stroke(0)
            buffer.strokeWeight(0)

            buffer.push()
            buffer.translate(sx, sy)
            buffer.rotate(block.body.angle)
            buffer.rectMode('center')

            // usa w y h guardados en el block
            buffer.rect(0, 0, block.w, block.h)
            buffer.pop()
        }
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

        // liga al pájaro activo si no fue lanzado
        const bird = world.activeBird
        if (bird && !bird.launched && bird.body.position.x > 0) {
            const bx = bird.body.position.x - camera.x
            const by = bird.body.position.y - camera.y
            buffer.stroke(180, 140, 40)
            buffer.strokeWeight(1)
            buffer.line(sx, sy, bx, by)
        }
    }

    _drawActiveBird(world, camera, buffer) {
        const bird = world.activeBird
        if (!bird || bird.dead) return

        const x = bird.launched ? bird.body.position.x : bird.x
        const y = bird.launched ? bird.body.position.y : bird.y
        const sx = x - camera.x
        const sy = y - camera.y
        const r = bird.config.radius

        buffer.fill(200, 40, 40)
        buffer.stroke(0)
        buffer.strokeWeight(0.5)
        buffer.circle(sx, sy, r * 2)
    }

    _drawTrail(world, camera, buffer) {
        const bird = world.activeBird
        if (!bird || !bird.launched || bird.trail.length < 2) return

        buffer.noFill()
        buffer.stroke(255, 255, 255, 160)
        buffer.strokeWeight(1)
        for (let i = 1; i < bird.trail.length; i++) {
            const a = bird.trail[i - 1]
            const b = bird.trail[i]
            buffer.line(a.x - camera.x, a.y - camera.y, b.x - camera.x, b.y - camera.y)
        }
    }

    _drawQueue(world, buffer) {
        let qx = 10
        const qy = INTERNAL_HEIGHT - 12
        for (const bird of world.birds) {
            const r = bird.config.radius * 0.6
            const [cr, cg, cb] = BIRD_COLORS[bird.type] ?? [200, 40, 40]
            buffer.fill(cr, cg, cb)
            buffer.noStroke()
            buffer.circle(qx + r, qy, r * 2)
            qx += r * 2 + 3
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