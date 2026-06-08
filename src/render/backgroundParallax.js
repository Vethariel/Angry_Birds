import { INTERNAL_WIDTH } from "../config/constants.js"
import {
    BG_SHEET_WIDTH,
    BG_LAYER_HEIGHT,
    BG_FAR_SRC_Y,
    BG_NEAR_SRC_Y,
    BG_PARALLAX_FAR,
    BG_PARALLAX_NEAR,
    BG_SKY_FILL,
} from "../config/backgroundConfig.js"

function parallaxOffset(cameraX, factor, tileW) {
    const raw = (cameraX * factor) % tileW
    return raw < 0 ? raw + tileW : raw
}

function drawTiledLayer(ctx, img, srcY, topY, bottomY, scrollX) {
    const destH = bottomY - topY
    let x = -scrollX

    while (x < INTERNAL_WIDTH) {
        ctx.drawImage(
            img,
            0, srcY, BG_SHEET_WIDTH, BG_LAYER_HEIGHT,
            Math.round(x), topY, BG_SHEET_WIDTH, destH
        )
        x += BG_SHEET_WIDTH
    }
}

export function drawParallaxBackground(buffer, assets, world, camera) {
    const sheet = assets?.get("background")
    const groundScreenY = Math.round(world.groundY - camera.y)
    const topY = groundScreenY - BG_LAYER_HEIGHT

    if (!sheet) {
        buffer.background(...BG_SKY_FILL)
        return
    }

    const img = sheet.canvas ?? sheet.elt
    const ctx = buffer.drawingContext

    if (topY > 0) {
        buffer.noStroke()
        buffer.fill(...BG_SKY_FILL)
        buffer.rect(0, 0, INTERNAL_WIDTH, topY)
    }

    ctx.save()
    ctx.imageSmoothingEnabled = false

    drawTiledLayer(
        ctx, img, BG_FAR_SRC_Y, topY, groundScreenY,
        parallaxOffset(camera.x, BG_PARALLAX_FAR, BG_SHEET_WIDTH)
    )
    drawTiledLayer(
        ctx, img, BG_NEAR_SRC_Y, topY, groundScreenY,
        parallaxOffset(camera.x, BG_PARALLAX_NEAR, BG_SHEET_WIDTH)
    )

    ctx.restore()
}
