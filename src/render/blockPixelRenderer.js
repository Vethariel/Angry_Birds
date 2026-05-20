// Snap render angle so diagonal staircases repeat a stable pixel pattern.
const ANGLE_SNAP = Math.PI / 64

function snapRenderAngle(angle) {
    return Math.round(angle / ANGLE_SNAP) * ANGLE_SNAP
}

function setPixel(pixels, bufW, bufH, x, y, [r, g, b]) {
    if (x < 0 || y < 0 || x >= bufW || y >= bufH) return
    const i = (y * bufW + x) * 4
    pixels[i]     = r
    pixels[i + 1] = g
    pixels[i + 2] = b
    pixels[i + 3] = 255
}

function pointInPoly(px, py, verts) {
    let inside = false
    for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
        const xi = verts[i].x, yi = verts[i].y
        const xj = verts[j].x, yj = verts[j].y
        const intersect = ((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }
    return inside
}

function boundsOf(verts) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const v of verts) {
        minX = Math.min(minX, v.x)
        minY = Math.min(minY, v.y)
        maxX = Math.max(maxX, v.x)
        maxY = Math.max(maxY, v.y)
    }
    return { minX, minY, maxX, maxY }
}

function centroidOf(verts) {
    let cx = 0, cy = 0
    for (const v of verts) { cx += v.x; cy += v.y }
    return { cx: cx / verts.length, cy: cy / verts.length }
}

const NEIGH4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]

/** Integer corners from body pose (not jittery physics verts). */
export function blockCornersToScreen(body, w, h, camera) {
    const angle = snapRenderAngle(body.angle)
    const cx = Math.round(body.position.x - camera.x)
    const cy = Math.round(body.position.y - camera.y)
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const hw = w * 0.5
    const hh = h * 0.5
    // CCW in screen space (y-down): TL → TR → BR → BL
    const local = [
        [-hw, -hh],
        [ hw, -hh],
        [ hw,  hh],
        [-hw,  hh],
    ]
    return local.map(([lx, ly]) => ({
        x: Math.round(cx + lx * c - ly * s),
        y: Math.round(cy + lx * s + ly * c),
    }))
}

/**
 * 4-connected pixels inside poly; depth 0 = 1px envelope touching outside.
 */
function buildInsideDepths(verts, bufW, bufH) {
    const { minX, minY, maxX, maxY } = boundsOf(verts)
    const x0 = Math.max(0, Math.floor(minX))
    const y0 = Math.max(0, Math.floor(minY))
    const x1 = Math.min(bufW - 1, Math.ceil(maxX))
    const y1 = Math.min(bufH - 1, Math.ceil(maxY))

    const inside = new Set()
    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (pointInPoly(x, y, verts)) inside.add(y * bufW + x)
        }
    }

    const depth = new Map()
    const queue = []

    for (const k of inside) {
        const x = k % bufW
        const y = (k / bufW) | 0
        let onEdge = false
        for (const [dx, dy] of NEIGH4) {
            const nx = x + dx, ny = y + dy
            if (nx < 0 || ny < 0 || nx >= bufW || ny >= bufH || !inside.has(ny * bufW + nx)) {
                onEdge = true
                break
            }
        }
        if (onEdge) {
            depth.set(k, 0)
            queue.push(k)
        }
    }

    for (let qi = 0; qi < queue.length; qi++) {
        const k = queue[qi]
        const d = depth.get(k)
        const x = k % bufW
        const y = (k / bufW) | 0
        for (const [dx, dy] of NEIGH4) {
            const nk = (y + dy) * bufW + (x + dx)
            if (!inside.has(nk) || depth.has(nk)) continue
            depth.set(nk, d + 1)
            queue.push(nk)
        }
    }

    return depth
}

function bresenhamLine(x0, y0, x1, y1, stamp) {
    x0 = Math.round(x0)
    y0 = Math.round(y0)
    x1 = Math.round(x1)
    y1 = Math.round(y1)
    let dx = Math.abs(x1 - x0)
    let dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy
    let x = x0, y = y0
    while (true) {
        stamp(x, y)
        if (x === x1 && y === y1) break
        const e2 = err * 2
        if (e2 > -dy) { err -= dy; x += sx }
        if (e2 < dx) { err += dx; y += sy }
    }
}

/**
 * 1px envelope (depth 0) + mid fill; damage shrinks fill inward by tier.
 */
export function rasterizeBlock(pixels, bufW, bufH, screenVerts, palette, tier) {
    const verts = screenVerts
    const depth = buildInsideDepths(verts, bufW, bufH)

    for (const [k, d] of depth) {
        const x = k % bufW
        const y = (k / bufW) | 0
        if (d <= tier) {
            setPixel(pixels, bufW, bufH, x, y, palette.dark)
        } else {
            setPixel(pixels, bufW, bufH, x, y, palette.mid)
        }
    }

    if (tier < 1) return

    const minDepth = tier + 1
    const { cx, cy } = centroidOf(verts)
    const a = verts[0]
    const c = verts[2] ?? verts[1]
    const scale = tier >= 2 ? 0.85 : 0.65

    const stampCrack = (x, y) => {
        const k = y * bufW + x
        const d = depth.get(k)
        if (d === undefined || d < minDepth) return
        setPixel(pixels, bufW, bufH, x, y, palette.light)
    }

    bresenhamLine(
        cx + (a.x - cx) * scale, cy + (a.y - cy) * scale,
        cx + (c.x - cx) * 0.2, cy + (c.y - cy) * 0.2,
        stampCrack)

    if (tier >= 2) {
        const b = verts[1]
        bresenhamLine(
            cx + (b.x - cx) * 0.3, cy + (b.y - cy) * scale,
            cx + (a.x - cx) * 0.2, cy + (a.y - cy) * 0.2,
            stampCrack)
    }
}

export function vertsOnScreen(verts, viewW) {
    let minX = Infinity, maxX = -Infinity
    for (const v of verts) {
        minX = Math.min(minX, v.x)
        maxX = Math.max(maxX, v.x)
    }
    return maxX >= 0 && minX <= viewW
}
