/** Victory celebration — birds hop in place at the slingshot. */

export const VICTORY_SMALL_JUMP_HEIGHT = 10
export const VICTORY_FLIP_JUMP_HEIGHT = 28

export const VICTORY_SMALL_JUMP_DURATION = 0.32
export const VICTORY_FLIP_JUMP_DURATION = 0.55

export const VICTORY_JUMP_MIN_COOLDOWN = 0.2
export const VICTORY_JUMP_MAX_COOLDOWN = 0.65
export const VICTORY_FLIP_CHANCE = 0.22
export const VICTORY_FLIP_STEPS = 24

function jumpHeight(kind) {
    return kind === "flip" ? VICTORY_FLIP_JUMP_HEIGHT : VICTORY_SMALL_JUMP_HEIGHT
}

function jumpDuration(kind) {
    return kind === "flip" ? VICTORY_FLIP_JUMP_DURATION : VICTORY_SMALL_JUMP_DURATION
}

export function initVictoryCelebration(birds, world) {
    const sling = world.slingshot
    for (let i = 0; i < birds.length; i++) {
        const bird = birds[i]
        bird.victoryBaseX = bird.queueX ?? bird.x ?? sling?.x ?? 0
        bird.victoryBaseY = bird.queueY ?? bird.y ?? sling?.y ?? 0
        bird.victoryFacingDeg = 0
        bird.victoryJump = null
        bird.victoryCooldown = 0.08 + (i * 0.14) % 0.4
    }
}

export function updateVictoryCelebration(birds, dt) {
    for (const bird of birds) {
        if (bird.victoryBaseX == null) continue

        if (bird.victoryJump) {
            bird.victoryJump.t += dt / bird.victoryJump.duration
            if (bird.victoryJump.t >= 1) {
                bird.victoryJump = null
                bird.victoryFacingDeg = 0
                bird.victoryCooldown =
                    VICTORY_JUMP_MIN_COOLDOWN +
                    Math.random() * (VICTORY_JUMP_MAX_COOLDOWN - VICTORY_JUMP_MIN_COOLDOWN)
            } else if (bird.victoryJump.kind === "flip") {
                const step = Math.min(
                    VICTORY_FLIP_STEPS - 1,
                    Math.floor(bird.victoryJump.t * VICTORY_FLIP_STEPS)
                )
                bird.victoryFacingDeg = step * 15
            }
            continue
        }

        bird.victoryCooldown -= dt
        if (bird.victoryCooldown > 0) continue

        const flip = Math.random() < VICTORY_FLIP_CHANCE
        const kind = flip ? "flip" : "small"
        bird.victoryJump = { kind, t: 0, duration: jumpDuration(kind) }
        if (!flip) bird.victoryFacingDeg = 0
    }
}

export function getCelebrationWorldPos(bird) {
    if (bird.victoryBaseX == null) return null

    let y = bird.victoryBaseY
    if (bird.victoryJump) {
        const h = jumpHeight(bird.victoryJump.kind)
        y -= Math.sin(bird.victoryJump.t * Math.PI) * h
    }

    return { x: bird.victoryBaseX, y }
}

export function isCelebratingBird(bird) {
    return bird.victoryBaseX != null
}
