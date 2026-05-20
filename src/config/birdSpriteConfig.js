// Red bird sprite sheet: 33×33 cells, 6 cols × 5 rows (assets/sprites/red.png)

export const BIRD_SPRITE_SIZE = 33
/** Pixels from anchor to cell edge; center pixel is at this offset in a 33×33 cell. */
export const BIRD_SPRITE_HALF = (BIRD_SPRITE_SIZE - 1) / 2
export const BIRD_SPRITE_COLS = 6
export const BIRD_SPRITE_ROT_STEP = 15
export const BIRD_SPRITE_ROT_BUCKETS = 6

export const BIRD_ROW_NORMAL_OPEN = 0
export const BIRD_ROW_NORMAL_CLOSED = 1
export const BIRD_ROW_HURT_OPEN = 2
export const BIRD_ROW_HURT_CLOSED = 3
export const BIRD_ROW_IMPACT_PARTICLES = 4

export const BIRD_IMPACT_PARTICLE_FRAMES = 4
export const BIRD_IMPACT_PARTICLE_FRAME_TIME = 0.06

export const BIRD_BLINK_INTERVAL = 0.35
export const BIRD_HIGH_IMPACT_IMPULSE = 9

/** Degrees closer to another quarter center before switching rot (reduces 270°↔0° snaps). */
export const BIRD_ROT_HYSTERESIS = 12

/** Sheet art faces left at 0°; add 180 so velocity angle matches screen facing. */
export const BIRD_SPRITE_DRAW_OFFSET = 180

/** Set true to log facing angle vs sprite column/flip when the frame changes. */
export const BIRD_SPRITE_DEBUG = true
