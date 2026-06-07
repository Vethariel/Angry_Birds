import {
    BIRD_SPRITE_SIZE,
    BIRD_SPRITE_HALF,
    BIRD_SPRITE_ROT_STEP,
    BIRD_ROW_NORMAL_OPEN,
    BIRD_ROW_NORMAL_CLOSED,
    BIRD_ROW_HURT_OPEN,
    BIRD_ROW_HURT_CLOSED,
    BIRD_ROW_IMPACT_PARTICLES,
    BIRD_IMPACT_PARTICLE_FRAMES,
    BIRD_IMPACT_PARTICLE_FRAME_TIME,
    BIRD_BLINK_INTERVAL,
    BIRD_CAL_COL,
    BIRD_CAL_ROT,
    BIRD_SPRITE_DRAW_OFFSET,
} from "../config/birdSpriteConfig.js"
import { BIRD_SETTLE_STOP_SPEED } from "../config/constants.js"
import { recordLaunchSample } from "../debug/flightReport.js"

const SPRITE_SHEETS = { red: "red" }

function mod(n, m) {
    return ((n % m) + m) % m
}

/** Half-extent from entity anchor to sprite edge (center pixel = anchor). */
export function birdSpriteHalf(bird) {
    const size = bird.config.spriteSize
    return size ? (size - 1) / 2 : bird.config.radius
}

/**
 * Eyes angle (0=right, clockwise) → sheet col + canvas quarter.
 * Calibrated LUT; round to nearest 15° avoids a 90° snap at the trajectory apex (~0°).
 */
export function birdSpriteFrame(angleDeg) {
    const a = mod(angleDeg, 360)
    const step = mod(Math.round(a / BIRD_SPRITE_ROT_STEP), BIRD_CAL_COL.length)
    const col = BIRD_CAL_COL[step]
    let rotation = BIRD_CAL_ROT[step]
    // Shallow rightward flight uses atan2 negative → 270–360°; LUT quarter 180 faces backwards.
    if (a > 270 && a < 360 && a % 90 !== 0) {
        rotation = 0
    }
    const local = (a - rotation + 360) % 360
    return { col, rotation, local }
}

/** Sub-bucket rotation so ground roll is visible between 15° LUT steps. */
export function birdSpriteDrawRotation(bird, facingDeg, frame) {
    if (!bird.onSurface) return frame.rotation

    const a = mod(facingDeg, 360)
    const bucket = Math.round(a / BIRD_SPRITE_ROT_STEP) * BIRD_SPRITE_ROT_STEP
    let fine = a - bucket
    if (fine > 180) fine -= 360
    if (fine < -180) fine += 360
    return frame.rotation + fine
}

export function birdSpriteRow(bird, worldTime) {
    const blinkOpen = Math.floor(worldTime / BIRD_BLINK_INTERVAL) % 2 === 0
    const hurt = bird.hurt

    if (bird.launched && !bird.dead) {
        return hurt ? (blinkOpen ? BIRD_ROW_HURT_OPEN : BIRD_ROW_HURT_CLOSED) : BIRD_ROW_NORMAL_CLOSED
    }

    if (hurt) {
        return blinkOpen ? BIRD_ROW_HURT_OPEN : BIRD_ROW_HURT_CLOSED
    }

    return blinkOpen ? BIRD_ROW_NORMAL_OPEN : BIRD_ROW_NORMAL_CLOSED
}

export function birdSpriteFacing(bird) {
    if (!bird.launched) {
        return { deg: 0, source: "sling" }
    }

    const v = bird.body.velocity
    const speed = Math.hypot(v.x, v.y)
    const bodyDeg = (bird.body.angle * 180) / Math.PI
    const velDeg = (Math.atan2(v.y, v.x) * 180) / Math.PI

    if (bird.onSurface) {
        return { deg: bodyDeg, source: "surface", bodyDeg, velDeg, speed }
    }

    if (!bird.dead) {
        if (speed >= BIRD_SETTLE_STOP_SPEED) {
            bird.facingDeg = velDeg
        }
        const deg = bird.facingDeg ?? velDeg
        const source = speed >= BIRD_SETTLE_STOP_SPEED ? "velocity" : "facingHold"
        return { deg, source, bodyDeg, velDeg, speed }
    }

    return { deg: bodyDeg, source: "body", bodyDeg, velDeg, speed }
}

/** Facing: velocity in air, body roll on ground, body freeze once landed in air. */
export function birdSpriteAngleDeg(bird) {
    return birdSpriteFacing(bird).deg
}

export function spawnImpactParticles(world, x, y, type = "red") {
    if (!world.impactParticles) world.impactParticles = []
    world.impactParticles.push({ x, y, type, frame: 0, timer: 0 })
}

export function updateImpactParticles(world, dt) {
    if (!world.impactParticles?.length) return

    const alive = []
    for (const p of world.impactParticles) {
        p.timer += dt
        while (p.timer >= BIRD_IMPACT_PARTICLE_FRAME_TIME) {
            p.timer -= BIRD_IMPACT_PARTICLE_FRAME_TIME
            p.frame++
        }
        if (p.frame < BIRD_IMPACT_PARTICLE_FRAMES) alive.push(p)
    }
    world.impactParticles = alive
}

function sheetFor(assets, type) {
    const key = SPRITE_SHEETS[type]
    return key ? assets?.get(key) : null
}

function drawSpriteCell(buffer, sheet, sx, sy, col, row, rotationDeg = 0) {
    const s = BIRD_SPRITE_SIZE
    const half = BIRD_SPRITE_HALF
    const dx = Math.round(sx)
    const dy = Math.round(sy)
    const img = sheet.canvas ?? sheet.elt
    const ctx = buffer.drawingContext

    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.translate(dx, dy)
    const drawRot = (rotationDeg + BIRD_SPRITE_DRAW_OFFSET) % 360
    ctx.rotate((drawRot * Math.PI) / 180)
    ctx.drawImage(
        img,
        col * s, row * s, s, s,
        -half, -half, s, s
    )
    ctx.restore()
}

export function drawBirdSprite(buffer, assets, bird, sx, sy, worldTime, phase, world) {
    if (!bird.launched) return false

    const sheet = sheetFor(assets, bird.type)
    if (!sheet) return false

    const facing = birdSpriteFacing(bird)
    const frame = birdSpriteFrame(facing.deg)
    const row = birdSpriteRow(bird, worldTime)
    if (world) recordLaunchSample(bird, facing, frame, row, phase, world)
    const drawRot = birdSpriteDrawRotation(bird, facing.deg, frame)
    drawSpriteCell(buffer, sheet, sx, sy, frame.col, row, drawRot)
    return true
}

export function drawImpactParticles(buffer, assets, world, camera) {
    if (!world.impactParticles?.length) return

    for (const p of world.impactParticles) {
        const sheet = sheetFor(assets, p.type)
        if (!sheet) continue

        const sx = p.x - camera.x
        const sy = p.y - camera.y
        drawSpriteCell(buffer, sheet, sx, sy, p.frame, BIRD_ROW_IMPACT_PARTICLES, 0)
    }
}
