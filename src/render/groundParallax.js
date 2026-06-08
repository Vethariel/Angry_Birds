import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from "../config/constants.js"
import {
    GROUND_SHEET_WIDTH,
    GROUND_LAYER_HEIGHT,
    GROUND_UNDERGROUND_SRC_Y,
    GROUND_TALL_GRASS_SRC_Y,
    GROUND_SHORT_GRASS_SRC_Y,
    GROUND_SHORT_GRASS_Y_OFFSET,
    GROUND_PARALLAX,
    GROUND_FILL,
} from "../config/groundConfig.js"

function scrollX(cameraX, factor, tileW) {
    const raw = (cameraX * factor) % tileW
    return raw < 0 ? raw + tileW : raw
}

function groundImage(assets) {
    const sheet = assets?.get("ground")
    if (!sheet) return null
    return sheet.canvas ?? sheet.elt
}

function groundScreenY(world, camera) {
    return Math.round(world.groundY - camera.y)
}

function drawTiledRow(ctx, img, srcY, destY, offsetX) {
    let x = -offsetX
    while (x < INTERNAL_WIDTH) {
        ctx.drawImage(
            img,
            0, srcY, GROUND_SHEET_WIDTH, GROUND_LAYER_HEIGHT,
            Math.round(x), destY, GROUND_SHEET_WIDTH, GROUND_LAYER_HEIGHT
        )
        x += GROUND_SHEET_WIDTH
    }
}

function drawUnderground(ctx, img, groundY, offsetX) {
    let y = groundY
    while (y < INTERNAL_HEIGHT) {
        drawTiledRow(ctx, img, GROUND_UNDERGROUND_SRC_Y, y, offsetX)
        y += GROUND_LAYER_HEIGHT
    }
}

function drawGrassUp(ctx, img, srcY, groundY, offsetX, yOffset = 0) {
    drawTiledRow(ctx, img, srcY, groundY - GROUND_LAYER_HEIGHT + yOffset, offsetX)
}

function withGroundDraw(buffer, assets, world, camera, draw) {
    const img = groundImage(assets)
    const groundY = groundScreenY(world, camera)

    if (!img) {
        buffer.noStroke()
        buffer.fill(...GROUND_FILL)
        buffer.rect(0, groundY, INTERNAL_WIDTH, INTERNAL_HEIGHT - groundY)
        return
    }

    const ctx = buffer.drawingContext
    const offsetX = scrollX(camera.x, GROUND_PARALLAX, GROUND_SHEET_WIDTH)

    ctx.save()
    ctx.imageSmoothingEnabled = false
    draw(ctx, img, groundY, offsetX)
    ctx.restore()
}

export function drawGroundUnderground(buffer, assets, world, camera) {
    withGroundDraw(buffer, assets, world, camera, drawUnderground)
}

export function drawGroundTallGrass(buffer, assets, world, camera) {
    withGroundDraw(buffer, assets, world, camera, (ctx, img, groundY, offsetX) => {
        drawGrassUp(ctx, img, GROUND_TALL_GRASS_SRC_Y, groundY, offsetX)
    })
}

export function drawGroundShortGrass(buffer, assets, world, camera) {
    withGroundDraw(buffer, assets, world, camera, (ctx, img, groundY, offsetX) => {
        drawGrassUp(ctx, img, GROUND_SHORT_GRASS_SRC_Y, groundY, offsetX, GROUND_SHORT_GRASS_Y_OFFSET)
    })
}
