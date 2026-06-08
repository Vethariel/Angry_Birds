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
export const BIRD_IMPACT_PARTICLE_FRAME_TIME = 0.1

export const BIRD_BLINK_INTERVAL = 0.35
export const BIRD_HIGH_IMPACT_IMPULSE = 3

/** Jump + flip from queue into slingshot anchor. */
export const BIRD_SLING_ENTER_DURATION = 0.45
export const BIRD_SLING_ENTER_JUMP = 28

/** Per 15° bucket: sheet col + canvas quarter only (0/90/180/270). Calibrated, DRAW_OFFSET 0. */
export const BIRD_CAL_COL = [0, 5, 4, 3, 2, 1, 0, 5, 4, 3, 2, 1, 0, 5, 4, 3, 2, 1, 0, 5, 4, 3, 2, 1]
export const BIRD_CAL_ROT = [0, 90, 90, 90, 90, 90, 90, 0, 0, 0, 0, 0, 0, 90, 90, 90, 90, 90, 90, 180, 180, 180, 180, 180]

/** PNG art + quarter rotation align with eyes angle (0=right, clockwise). */
export const BIRD_SPRITE_DRAW_OFFSET = 0

/** Auto-download launch-report-<timestamp>.txt after each red bird shot. */
export const BIRD_LAUNCH_REPORT = false
