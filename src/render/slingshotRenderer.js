import {
    SLINGSHOT_SHEET_WIDTH,
    SLINGSHOT_LAYER_HEIGHT,
    SLINGSHOT_BACK_SRC_Y,
    SLINGSHOT_FRONT_SRC_Y,
    SLINGSHOT_BAND_OFFSET,
    SLINGSHOT_BAND_HALF_WIDTH,
    SLINGSHOT_BAND_PALETTE,
} from "../config/slingshotConfig.js"
import { rasterizeBlock } from "./blockPixelRenderer.js"
import { birdPreFlightFacing, birdSpriteHalf } from "./birdSpriteRenderer.js"

function slingshotImage(assets) {
    const sheet = assets?.get("slingshot")
    if (!sheet) return null
    return sheet.canvas ?? sheet.elt
}

function slingshotLayout(world, camera) {
    const groundY = Math.round(world.groundY - camera.y)
    const sx = Math.round(world.slingshot.x - camera.x)
    const destX = sx - SLINGSHOT_SHEET_WIDTH / 2
    const destY = groundY - SLINGSHOT_LAYER_HEIGHT
    const forkY = Math.round(world.slingshot.y - camera.y)

    return { destX, destY, sx, forkY, groundY }
}

function drawLayer(ctx, img, srcY, destX, destY) {
    ctx.drawImage(
        img,
        0, srcY, SLINGSHOT_SHEET_WIDTH, SLINGSHOT_LAYER_HEIGHT,
        Math.round(destX), destY, SLINGSHOT_SHEET_WIDTH, SLINGSHOT_LAYER_HEIGHT
    )
}

function drawFallbackPost(buffer, sx, forkY, groundY) {
    buffer.stroke(100, 60, 20)
    buffer.strokeWeight(2)
    buffer.line(sx, forkY, sx, groundY)
}

function lineToQuad(ax, ay, bx, by, halfW) {
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    const px = (-dy / len) * halfW
    const py = (dx / len) * halfW

    return [
        { x: Math.round(ax + px), y: Math.round(ay + py) },
        { x: Math.round(bx + px), y: Math.round(by + py) },
        { x: Math.round(bx - px), y: Math.round(by - py) },
        { x: Math.round(ax - px), y: Math.round(ay - py) },
    ]
}

function birdTailAxis(bird, phase, world) {
    const { deg } = birdPreFlightFacing(bird, phase, world)
    const rad = (deg * Math.PI) / 180
    const tailX = Math.cos(rad)
    const tailY = Math.sin(rad)
    return { tailX, tailY, perpX: -tailY, perpY: tailX }
}

function slingGeometry(world, camera, bird, phase) {
    const { sx, forkY } = slingshotLayout(world, camera)
    const bx = Math.round(bird.x - camera.x)
    const by = Math.round(bird.y - camera.y)

    const forkLeft = { x: sx - SLINGSHOT_BAND_OFFSET, y: forkY }
    const forkRight = { x: sx + SLINGSHOT_BAND_OFFSET, y: forkY }

    const { tailX, tailY, perpX, perpY } = birdTailAxis(bird, phase, world)
    const half = birdSpriteHalf(bird)
    const tailOffset = half * 0.17
    const depth = half * 0.45
    const spread = half * 0.48

    const seatAnchor = {
        x: Math.round(bx + tailX * tailOffset),
        y: Math.round(by + tailY * tailOffset),
    }

    const seatBackLeft = {
        x: Math.round(seatAnchor.x + tailX * depth + perpX * spread),
        y: Math.round(seatAnchor.y + tailY * depth + perpY * spread),
    }
    const seatBackRight = {
        x: Math.round(seatAnchor.x + tailX * depth - perpX * spread),
        y: Math.round(seatAnchor.y + tailY * depth - perpY * spread),
    }

    return { forkLeft, forkRight, seatAnchor, seatBackLeft, seatBackRight }
}

function canDrawSling(world, phase) {
    const bird = world.activeBird
    return bird
        && !bird.launched
        && bird.slingReady
        && phase === "PULLING"
        && world.pullVector
}

function rasterizePoly(buffer, verts) {
    rasterizeBlock(
        buffer.pixels, buffer.width, buffer.height,
        verts, SLINGSHOT_BAND_PALETTE, 0
    )
}

function drawBandQuad(buffer, ax, ay, bx, by) {
    rasterizePoly(buffer, lineToQuad(ax, ay, bx, by, SLINGSHOT_BAND_HALF_WIDTH))
}

export function drawSlingshotBack(buffer, assets, world, camera) {
    const img = slingshotImage(assets)
    const { destX, destY, sx, forkY, groundY } = slingshotLayout(world, camera)

    if (!img) {
        drawFallbackPost(buffer, sx, forkY, groundY)
        return
    }

    const ctx = buffer.drawingContext
    ctx.save()
    ctx.imageSmoothingEnabled = false
    drawLayer(ctx, img, SLINGSHOT_BACK_SRC_Y, destX, destY)
    ctx.restore()
}

export function drawSlingshotFront(buffer, assets, world, camera) {
    const img = slingshotImage(assets)
    if (!img) return

    const { destX, destY } = slingshotLayout(world, camera)
    const ctx = buffer.drawingContext

    ctx.save()
    ctx.imageSmoothingEnabled = false
    drawLayer(ctx, img, SLINGSHOT_FRONT_SRC_Y, destX, destY)
    ctx.restore()
}

/** Left fork → seat anchor; drawn behind the bird. */
export function drawSlingshotBandBack(buffer, world, camera, phase) {
    if (!canDrawSling(world, phase)) return

    const bird = world.activeBird
    const { forkLeft, seatAnchor } = slingGeometry(world, camera, bird, phase)

    buffer.loadPixels()
    drawBandQuad(buffer, forkLeft.x, forkLeft.y, seatAnchor.x, seatAnchor.y)
    buffer.updatePixels()
}

/** Seat pouch at the bird tail; anchor is where both bands meet. */
export function drawSlingshotSeat(buffer, world, camera, phase) {
    if (!canDrawSling(world, phase)) return

    const bird = world.activeBird
    const { seatAnchor, seatBackLeft, seatBackRight } = slingGeometry(world, camera, bird, phase)

    buffer.loadPixels()
    rasterizePoly(buffer, [seatAnchor, seatBackLeft, seatBackRight])
    buffer.updatePixels()
}

/** Right fork → seat anchor; drawn in front of the bird and seat. */
export function drawSlingshotBandFront(buffer, world, camera, phase) {
    if (!canDrawSling(world, phase)) return

    const bird = world.activeBird
    const { forkRight, seatAnchor } = slingGeometry(world, camera, bird, phase)

    buffer.loadPixels()
    drawBandQuad(buffer, forkRight.x, forkRight.y, seatAnchor.x, seatAnchor.y)
    buffer.updatePixels()
}
