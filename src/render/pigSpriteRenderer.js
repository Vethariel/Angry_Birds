import {
    PIG_SPRITE_SIZE,
    PIG_SPRITE_HALF,
    PIG_SPRITE_ROT_STEP,
    PIG_ROW_NORMAL_OPEN,
    PIG_ROW_NORMAL_CLOSED,
    PIG_ROW_HURT_OPEN,
    PIG_ROW_HURT_CLOSED,
    PIG_ROW_DEATH,
    PIG_DEATH_FRAMES,
    PIG_DEATH_FRAME_TIME,
    PIG_BLINK_INTERVAL,
    PIG_CAL_COL,
    PIG_CAL_ROT,
    PIG_SPRITE_DRAW_OFFSET,
} from "../config/pigSpriteConfig.js"
import { assertQuarterTurnLUT, drawSpriteCell } from "./spriteQuarters.js"

assertQuarterTurnLUT("pig", PIG_CAL_ROT)

const SPRITE_SHEETS = { pig: "pig" }

function mod(n, m) {
    return ((n % m) + m) % m
}

export function pigSpriteHalf(pig) {
    const size = pig.config.spriteSize
    return size ? (size - 1) / 2 : pig.config.radius
}

/**
 * Facing angle → sheet col + quarter turn (0/90/180/270). No arbitrary canvas rotation.
 */
export function pigSpriteFrame(angleDeg) {
    const a = mod(angleDeg, 360)
    const step = mod(Math.round(a / PIG_SPRITE_ROT_STEP), PIG_CAL_COL.length)
    const col = PIG_CAL_COL[step]
    let rotation = PIG_CAL_ROT[step]
    if (a > 270 && a < 360 && a % 90 !== 0) {
        rotation = 0
    }
    return { col, rotation }
}

export function pigSpriteFacing(pig) {
    if (!pig.body) return { deg: pig.facingDeg ?? 0 }

    const v = pig.body.velocity
    const speed = Math.hypot(v.x, v.y)
    const bodyDeg = (pig.body.angle * 180) / Math.PI
    const angVel = Math.abs(pig.body.angularVelocity)

    // Rolling / sliding: body angle picks the 15° sheet bucket (same rule as birds on surface).
    if (angVel > 0.04 || (speed > 0.01 && speed < 0.35)) {
        return { deg: bodyDeg, source: "body" }
    }

    if (speed >= 0.35) {
        pig.facingDeg = (Math.atan2(v.y, v.x) * 180) / Math.PI
    }

    const deg = pig.facingDeg ?? bodyDeg
    const source = speed >= 0.35 ? "velocity" : "body"
    return { deg, source }
}

export function pigSpriteRow(pig, worldTime) {
    const blinkOpen = Math.floor(worldTime / PIG_BLINK_INTERVAL) % 2 === 0

    if (pig.hurt) {
        return blinkOpen ? PIG_ROW_HURT_OPEN : PIG_ROW_HURT_CLOSED
    }

    return blinkOpen ? PIG_ROW_NORMAL_OPEN : PIG_ROW_NORMAL_CLOSED
}

export function updatePigDeathAnimations(world, dt) {
    for (const pig of world.pigs) {
        if (!pig.dead || pig.deathAnimDone) continue

        pig.deathTimer = (pig.deathTimer ?? 0) + dt
        while (pig.deathTimer >= PIG_DEATH_FRAME_TIME) {
            pig.deathTimer -= PIG_DEATH_FRAME_TIME
            pig.deathFrame = (pig.deathFrame ?? 0) + 1
        }

        if (pig.deathFrame >= PIG_DEATH_FRAMES) {
            pig.deathAnimDone = true
        }
    }
}

function sheetFor(assets) {
    return assets?.get(SPRITE_SHEETS.pig) ?? null
}

function drawPigCell(buffer, sheet, sx, sy, col, row, rotationDeg) {
    return drawSpriteCell(
        buffer, sheet, sx, sy, col, row,
        PIG_SPRITE_SIZE, PIG_SPRITE_HALF, rotationDeg, PIG_SPRITE_DRAW_OFFSET
    )
}

export function drawPigSprite(buffer, assets, pig, sx, sy, worldTime) {
    const sheet = sheetFor(assets)
    if (!sheet) return false

    if (pig.dead) {
        const frame = Math.min(pig.deathFrame ?? 0, PIG_DEATH_FRAMES - 1)
        drawPigCell(buffer, sheet, sx, sy, frame, PIG_ROW_DEATH, 0)
        return true
    }

    const facing = pigSpriteFacing(pig)
    const frame = pigSpriteFrame(facing.deg)
    const row = pigSpriteRow(pig, worldTime)
    drawPigCell(buffer, sheet, sx, sy, frame.col, row, frame.rotation)
    return true
}
