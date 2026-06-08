/** Pixel-art rule: canvas rotation is quarter-turn only (0/90/180/270). */

const QUARTER_TURNS = new Set([0, 90, 180, 270])

/** Fail fast if a LUT entry is not a quarter turn. */
export function assertQuarterTurnLUT(label, rotTable) {
    rotTable.forEach((rot, i) => {
        const r = ((rot % 360) + 360) % 360
        if (!QUARTER_TURNS.has(r)) {
            throw new Error(`[sprite] ${label} CAL_ROT[${i}]=${rot} must be 0, 90, 180, or 270`)
        }
    })
}

export function quarterTurnDeg(rotationDeg, drawOffset = 0) {
    const r = ((rotationDeg + drawOffset) % 360 + 360) % 360
    return (Math.round(r / 90) * 90) % 360
}

export function drawSpriteCell(buffer, sheet, sx, sy, col, row, cellSize, cellHalf, rotationDeg, drawOffset = 0) {
    const dx = Math.round(sx)
    const dy = Math.round(sy)
    const img = sheet.canvas ?? sheet.elt
    const ctx = buffer.drawingContext
    const drawRot = quarterTurnDeg(rotationDeg, drawOffset)

    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.translate(dx, dy)
    ctx.rotate((drawRot * Math.PI) / 180)
    ctx.drawImage(
        img,
        col * cellSize, row * cellSize, cellSize, cellSize,
        -cellHalf, -cellHalf, cellSize, cellSize
    )
    ctx.restore()

    return drawRot
}
