import {
    SCORE_POPUP_COLOR,
    SCORE_POPUP_OUTLINE,
    BIRD_SCORE_POPUP_COLORS,
    BIRD_SCORE_POPUP_OUTLINES,
    SCORE_POPUP_DURATION,
    SCORE_POPUP_FLOAT_SPEED,
    SCORE_POPUP_TEXT_SIZE,
    SCORE_HUD_X,
    SCORE_HUD_Y,
    SCORE_HUD_SIZE,
    SCORE_HUD_COLOR,
    SCORE_HUD_OUTLINE,
} from "../config/scoreConfig.js"

export function spawnScorePopup(world, x, y, value, { color, outline } = {}) {
    if (!world.scorePopups) world.scorePopups = []
    world.scorePopups.push({ x, y, value, age: 0, color, outline })
}

export function awardScorePopup(world, x, y, value, style = {}) {
    spawnScorePopup(world, x, y, value, style)
    world.score += value
}

export function awardBirdBonus(world, bird, value) {
    const sling = world.slingshot
    const x = bird.queueX ?? bird.x ?? sling?.x ?? 0
    const y = bird.queueY ?? bird.y ?? sling?.y ?? 0
    const type = bird.type ?? "red"
    awardScorePopup(world, x, y, value, {
        color: BIRD_SCORE_POPUP_COLORS[type] ?? BIRD_SCORE_POPUP_COLORS.red,
        outline: BIRD_SCORE_POPUP_OUTLINES[type] ?? BIRD_SCORE_POPUP_OUTLINES.red,
    })
}

export function updateScorePopups(world, dt) {
    if (!world.scorePopups?.length) return

    const alive = []
    for (const popup of world.scorePopups) {
        popup.age += dt
        if (popup.age < SCORE_POPUP_DURATION) alive.push(popup)
    }
    world.scorePopups = alive
}

export function drawScorePopups(buffer, world, camera) {
    if (!world.scorePopups?.length) return

    buffer.textSize(SCORE_POPUP_TEXT_SIZE)
    buffer.textAlign("center", "center")

    for (const popup of world.scorePopups) {
        const sx = Math.round(popup.x - camera.x)
        const sy = Math.round(popup.y - camera.y - popup.age * SCORE_POPUP_FLOAT_SPEED)

        const t = popup.age / SCORE_POPUP_DURATION
        const alpha = t < 0.65 ? 255 : Math.round(255 * (1 - (t - 0.65) / 0.35))
        if (alpha <= 0) continue

        const label = `${popup.value}`
        const fill = popup.color ?? SCORE_POPUP_COLOR
        const outline = popup.outline ?? SCORE_POPUP_OUTLINE

        buffer.stroke(...outline, alpha)
        buffer.strokeWeight(2)
        buffer.fill(...fill, alpha)
        buffer.text(label, sx, sy)
    }

    buffer.noStroke()
}

export function drawScoreHUD(buffer, score) {
    const label = `${score}`
    buffer.textAlign("right", "top")
    buffer.textSize(SCORE_HUD_SIZE)
    buffer.noStroke()
    buffer.fill(...SCORE_HUD_OUTLINE)
    buffer.text(label, SCORE_HUD_X + 2, SCORE_HUD_Y + 2)
    buffer.fill(...SCORE_HUD_COLOR)
    buffer.text(label, SCORE_HUD_X, SCORE_HUD_Y)
}
