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
import { assertQuarterTurnLUT, drawSpriteCell } from "./spriteQuarters.js"

assertQuarterTurnLUT("bird", BIRD_CAL_ROT)

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
 * Facing angle → sheet col + quarter turn (0/90/180/270). No arbitrary canvas rotation.
 */
export function birdSpriteFrame(angleDeg) {
    const a = mod(angleDeg, 360)
    const step = mod(Math.round(a / BIRD_SPRITE_ROT_STEP), BIRD_CAL_COL.length)
    const col = BIRD_CAL_COL[step]
    let rotation = BIRD_CAL_ROT[step]
    if (a > 270 && a < 360 && a % 90 !== 0) {
        rotation = 0
    }
    const local = (a - rotation + 360) % 360
    return { col, rotation, local }
}

function isActiveSlingBird(bird, world) {
    return world?.activeBird === bird
}

function drawBirdCell(buffer, sheet, sx, sy, col, row, rotationDeg) {
    return drawSpriteCell(
        buffer, sheet, sx, sy, col, row,
        BIRD_SPRITE_SIZE, BIRD_SPRITE_HALF, rotationDeg, BIRD_SPRITE_DRAW_OFFSET
    )
}

/** Pre-launch: queue idle, sling entry flip (15° sheet steps), or pull angle. */
export function birdPreFlightFacing(bird, phase, world) {
    if (phase === "VICTORY_CELEBRATION" && bird.victoryBaseX != null) {
        return { deg: bird.victoryFacingDeg ?? 0, source: "victory" }
    }

    if (bird.slingEnterFrom && bird.slingReady === false && (bird.slingEnterT ?? 0) < 1) {
        return { deg: bird.slingEnterFacingDeg ?? 0, source: "enter" }
    }

    if (phase === "PULLING" && world?.pullVector && isActiveSlingBird(bird, world)) {
        const { x, y } = world.pullVector
        if (x !== 0 || y !== 0) {
            const deg = (Math.atan2(y, x) * 180) / Math.PI
            return { deg, source: "pull" }
        }
    }

    return { deg: 0, source: "sling" }
}

export function birdPreFlightRow(bird, worldTime, phase, world) {
    if (phase === "VICTORY_CELEBRATION" && bird.victoryBaseX != null) {
        return BIRD_ROW_NORMAL_OPEN
    }

    if (bird.slingEnterFrom && bird.slingReady === false && (bird.slingEnterT ?? 0) < 1) {
        return BIRD_ROW_NORMAL_OPEN
    }
    if (phase === "PULLING" && isActiveSlingBird(bird, world)) {
        return BIRD_ROW_NORMAL_CLOSED
    }
    return birdSpriteRow(bird, worldTime)
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

export function drawBirdSprite(buffer, assets, bird, sx, sy, worldTime, phase, world) {
    const sheet = sheetFor(assets, bird.type)
    if (!sheet) return false

    const facing = bird.launched ? birdSpriteFacing(bird) : birdPreFlightFacing(bird, phase, world)
    const frame = birdSpriteFrame(facing.deg)
    const row = bird.launched
        ? birdSpriteRow(bird, worldTime)
        : birdPreFlightRow(bird, worldTime, phase, world)

    if (world && bird.launched) {
        recordLaunchSample(bird, facing, frame, row, phase, world)
    }

    drawBirdCell(buffer, sheet, sx, sy, frame.col, row, frame.rotation)
    return true
}

export function drawImpactParticles(buffer, assets, world, camera) {
    if (!world.impactParticles?.length) return

    for (const p of world.impactParticles) {
        const sheet = sheetFor(assets, p.type)
        if (!sheet) continue

        const sx = p.x - camera.x
        const sy = p.y - camera.y
        drawBirdCell(buffer, sheet, sx, sy, p.frame, BIRD_ROW_IMPACT_PARTICLES, 0)
    }
}
