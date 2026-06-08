import { INTERNAL_WIDTH, INTERNAL_HEIGHT, GROUND_Y } from "../config/constants.js"
import {
    BIRD_SPRITE_SIZE,
    BIRD_SPRITE_HALF,
    BIRD_ROW_NORMAL_OPEN,
    BIRD_ROW_NORMAL_CLOSED,
} from "../config/birdSpriteConfig.js"
import { drawSpriteCell } from "./spriteQuarters.js"
import { UI, UI_LEVEL_CARD } from "../config/uiConfig.js"

export function drawTextShadow(buffer, text, x, y, {
    size = 8,
    fill = UI.TEXT_WHITE,
    shadow = UI.TEXT_SHADOW,
    align = "center",
    baseline = "center",
    offset = 1,
} = {}) {
    buffer.textAlign(align, baseline)
    buffer.textSize(size)
    buffer.noStroke()
    buffer.fill(...shadow)
    buffer.text(text, x + offset, y + offset)
    buffer.fill(...fill)
    buffer.text(text, x, y)
}

export function drawWoodPanel(buffer, x, y, w, h, { rim = true } = {}) {
    buffer.noStroke()
    buffer.fill(...UI.WOOD_BORDER)
    buffer.rect(x, y, w, h, 4)
    buffer.fill(...UI.WOOD_MID)
    buffer.rect(x + 2, y + 2, w - 4, h - 4, 3)
    buffer.fill(...UI.WOOD_LIGHT)
    buffer.rect(x + UI.PANEL_INSET, y + UI.PANEL_INSET, w - UI.PANEL_INSET * 2, h - 10, 2)
    if (rim) {
        buffer.noFill()
        buffer.stroke(...UI.WOOD_DARK)
        buffer.strokeWeight(1)
        buffer.rect(x + 1.5, y + 1.5, w - 3, h - 3, 3)
        buffer.noStroke()
    }
}

export function drawAngryBirdsTitle(buffer, cx, cy) {
    const panelW = 220
    const panelH = 72
    const px = cx - panelW / 2
    const py = cy - panelH / 2 - 8
    drawWoodPanel(buffer, px, py, panelW, panelH)

    drawTextShadow(buffer, "ANGRY", cx, cy - 18, {
        size: 22,
        fill: UI.TITLE_RED,
        shadow: UI.TITLE_DARK,
        offset: 2,
    })
    drawTextShadow(buffer, "BIRDS", cx, cy + 8, {
        size: 22,
        fill: UI.TITLE_RED,
        shadow: UI.TITLE_DARK,
        offset: 2,
    })
}

export function drawUiButton(buffer, x, y, w, h, label, selected) {
    buffer.noStroke()
    if (selected) {
        buffer.fill(...UI.ACCENT_YELLOW)
        buffer.rect(x - 1, y - 1, w + 2, h + 2, 5)
    }
    drawWoodPanel(buffer, x, y, w, h, { rim: true })
    drawTextShadow(buffer, label, x + w / 2, y + h / 2 + 1, {
        size: 9,
        fill: selected ? UI.TEXT_WHITE : UI.TEXT_CREAM,
        shadow: UI.TEXT_SHADOW,
    })
}

export function buttonHit(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h
}

export function layoutButtons(count, btnW = UI.BTN_W, btnH = UI.BTN_H, gap = UI.BTN_GAP, centerY = INTERNAL_HEIGHT / 2) {
    const totalH = count * btnH + (count - 1) * gap
    const startY = centerY - totalH / 2
    const x = (INTERNAL_WIDTH - btnW) / 2
    return Array.from({ length: count }, (_, i) => ({
        x,
        y: startY + i * (btnH + gap),
        w: btnW,
        h: btnH,
    }))
}

/** Returns hovered index; fires onClick(index) on mouse press. */
export function handleMouseButtons(input, layout, onClick) {
    let hovered = null
    for (let i = 0; i < layout.length; i++) {
        const { x, y, w, h } = layout[i]
        if (buttonHit(input.mouseBufferX, input.mouseBufferY, x, y, w, h)) {
            hovered = i
            if (input.mouseJustDown) onClick(i)
            break
        }
    }
    return hovered
}

export function computeLevelGrid(total, W = INTERNAL_WIDTH, H = INTERNAL_HEIGHT) {
    const { W: cardW, H: cardH, GAP: gap } = UI_LEVEL_CARD
    const cols = Math.min(total, 6)
    const rows = Math.ceil(total / cols)
    const gridW = cols * (cardW + gap) - gap
    const startX = (W - gridW) / 2
    const startY = H / 2 - (rows * (cardH + gap)) / 2 - 8
    const cards = []
    for (let i = 0; i < total; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        cards.push({
            index: i,
            x: startX + col * (cardW + gap),
            y: startY + row * (cardH + gap),
            w: cardW,
            h: cardH,
        })
    }
    return { cards, labelY: startY + rows * (cardH + gap) + 18, cardW, cardH }
}

export function drawUiHint(buffer, text, y, visible) {
    if (!visible) return
    drawTextShadow(buffer, text, INTERNAL_WIDTH / 2, y, {
        size: 8,
        fill: UI.ACCENT_YELLOW,
        shadow: UI.TEXT_SHADOW,
    })
}

export function drawSectionTitle(buffer, text, y) {
    drawTextShadow(buffer, text, INTERNAL_WIDTH / 2, y, {
        size: 12,
        fill: UI.TEXT_CREAM,
        shadow: UI.TEXT_SHADOW,
        offset: 2,
    })
}

export function drawLevelCard(buffer, x, y, w, h, levelNum, { selected, unlocked }) {
    buffer.noStroke()
    if (selected) {
        buffer.fill(...UI.ACCENT_YELLOW)
        buffer.rect(x - 2, y - 2, w + 4, h + 4, 6)
    }
    if (unlocked) {
        drawWoodPanel(buffer, x, y, w, h)
    } else {
        buffer.fill(...UI.WOOD_BORDER)
        buffer.rect(x, y, w, h, 4)
        buffer.fill(40, 38, 36)
        buffer.rect(x + 2, y + 2, w - 4, h - 4, 3)
    }

    if (unlocked) {
        drawTextShadow(buffer, `${levelNum}`, x + w / 2, y + h / 2 - 4, {
            size: 14,
            fill: selected ? UI.TITLE_RED : UI.TEXT_WHITE,
            shadow: UI.TEXT_SHADOW,
        })
        const starY = y + h - 10
        for (let s = 0; s < 3; s++) {
            const sx = x + w / 2 + (s - 1) * 10
            buffer.textSize(6)
            buffer.textAlign("center", "center")
            buffer.fill(...UI.STAR_EMPTY)
            buffer.text("★", sx, starY)
        }
    } else {
        drawTextShadow(buffer, "?", x + w / 2, y + h / 2, {
            size: 12,
            fill: UI.LOCK,
            shadow: [20, 20, 24],
        })
    }
}

export function drawMenuBird(buffer, assets, time) {
    const sheet = assets?.get("red")
    if (!sheet) return

    const bounce = Math.sin(time * 3.2) * 5
    const bx = INTERNAL_WIDTH * 0.72
    const by = GROUND_Y - 28 + bounce
    const blink = Math.floor(time / 0.35) % 2 === 0
    const row = blink ? BIRD_ROW_NORMAL_OPEN : BIRD_ROW_NORMAL_CLOSED

    drawSpriteCell(
        buffer, sheet, bx, by,
        0, row,
        BIRD_SPRITE_SIZE, BIRD_SPRITE_HALF,
        0, 0
    )
}

export function drawOverlayDim(buffer, alpha = UI.OVERLAY_DIM[3]) {
    buffer.noStroke()
    buffer.fill(UI.OVERLAY_DIM[0], UI.OVERLAY_DIM[1], UI.OVERLAY_DIM[2], alpha)
    buffer.rect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT)
}

export function drawOverlayTitle(buffer, text, y, color) {
    drawTextShadow(buffer, text, INTERNAL_WIDTH / 2, y, {
        size: 16,
        fill: color,
        shadow: UI.TEXT_SHADOW,
        offset: 2,
    })
}

export { UI_LEVEL_CARD }
