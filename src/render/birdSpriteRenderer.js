import {
    BIRD_SPRITE_SIZE,
    BIRD_SPRITE_HALF,
    BIRD_SPRITE_ROT_STEP,
    BIRD_SPRITE_ROT_BUCKETS,
    BIRD_ROW_NORMAL_OPEN,
    BIRD_ROW_NORMAL_CLOSED,
    BIRD_ROW_HURT_OPEN,
    BIRD_ROW_HURT_CLOSED,
    BIRD_ROW_IMPACT_PARTICLES,
    BIRD_IMPACT_PARTICLE_FRAMES,
    BIRD_IMPACT_PARTICLE_FRAME_TIME,
    BIRD_BLINK_INTERVAL,
    BIRD_SPRITE_DEBUG,
    BIRD_ROT_HYSTERESIS,
    BIRD_SPRITE_DRAW_OFFSET,
} from "../config/birdSpriteConfig.js"

const SPRITE_SHEETS = { red: "red" }

/** Half-extent from entity anchor to sprite edge (center pixel = anchor). */
export function birdSpriteHalf(bird) {
    const size = bird.config.spriteSize
    return size ? (size - 1) / 2 : bird.config.radius
}

/**
 * Angle (deg, 0 = right, clockwise) → canvas rotation (0/90/180/270) + sheet col.
 * Sheet frames are 0°–75° in 15° steps; rotating 90° covers the next 90° of facing.
 * Col 0 spans 352.5°–360° and 0°–7.5° (±7.5° around each 15° step).
 */
function _quarterCenter(rotation) {
    return (rotation + 45) % 360
}

function _angleDist(a, center) {
    let d = Math.abs(a - center)
    if (d > 180) d = 360 - d
    return d
}

export function birdSpriteFrame(angleDeg, prevRotation = 0) {
    const a = ((angleDeg % 360) + 360) % 360
    const natural = Math.floor(a / 90) * 90
    let rotation = prevRotation ?? natural

    if (natural !== rotation) {
        const toNatural = _angleDist(a, _quarterCenter(natural))
        const toPrev = _angleDist(a, _quarterCenter(rotation))
        if (toNatural + BIRD_ROT_HYSTERESIS < toPrev) {
            rotation = natural
        }
    }

    let local = (a - rotation + 360) % 360
    if (local > 90) {
        rotation = natural
        local = a - rotation
    }
    if (local > 75) local = 75

    const col = Math.min(
        BIRD_SPRITE_ROT_BUCKETS - 1,
        Math.max(0, Math.floor((local + BIRD_SPRITE_ROT_STEP / 2) / BIRD_SPRITE_ROT_STEP))
    )
    return { col, rotation, local }
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

    if (!bird.dead) {
        return { deg: velDeg, source: "velocity", bodyDeg, velDeg, speed }
    }

    return { deg: bodyDeg, source: "body", bodyDeg, velDeg, speed }
}

/** Facing angle: velocity while moving, body angle when resting. */
export function birdSpriteAngleDeg(bird) {
    return birdSpriteFacing(bird).deg
}

let _lastSpriteDebugKey = ""

function logBirdSpriteDebug(bird, facing, frame, row) {
    if (!BIRD_SPRITE_DEBUG || bird.type !== "red" || !bird.launched) return

    const key = `${frame.col}|${frame.rotation}|${frame.local.toFixed(0)}|${row}`

    if (key === _lastSpriteDebugKey) return
    _lastSpriteDebugKey = key

    const a = ((facing.deg % 360) + 360) % 360
    const sheetDeg = frame.col * BIRD_SPRITE_ROT_STEP
    const bucket = frame.col === 0
        ? "352.5-360, 0-7.5"
        : `${(sheetDeg - 7.5).toFixed(1)}-${(sheetDeg + 7.5).toFixed(1)}`

    console.log(
        `[bird sprite] facing=${facing.deg.toFixed(1)}° → a=${a.toFixed(1)}°` +
        ` rot=${frame.rotation}° draw=${((frame.rotation + BIRD_SPRITE_DRAW_OFFSET) % 360)}°` +
        ` local=${frame.local.toFixed(1)}°` +
        ` → col=${frame.col} (${sheetDeg}° bucket ${bucket})` +
        ` | src=${facing.source} vel=${facing.velDeg?.toFixed(1) ?? "-"}°` +
        ` body=${facing.bodyDeg?.toFixed(1) ?? "-"}° spd=${facing.speed?.toFixed(1) ?? "-"} row=${row}`
    )
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

export function drawBirdSprite(buffer, assets, bird, sx, sy, worldTime) {
    const sheet = sheetFor(assets, bird.type)
    if (!sheet) return false

    const facing = birdSpriteFacing(bird)
    const frame = birdSpriteFrame(facing.deg, bird.spriteRotation ?? 0)
    if (bird.launched) bird.spriteRotation = frame.rotation
    const row = birdSpriteRow(bird, worldTime)
    logBirdSpriteDebug(bird, facing, frame, row)
    drawSpriteCell(buffer, sheet, sx, sy, frame.col, row, frame.rotation)
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
