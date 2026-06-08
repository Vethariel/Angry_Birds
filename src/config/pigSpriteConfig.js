// Pig sprite sheet: 33×33 cells, 6 cols × 5 rows (assets/sprites/pig.png)

export const PIG_SPRITE_SIZE = 33
export const PIG_SPRITE_HALF = (PIG_SPRITE_SIZE - 1) / 2
export const PIG_SPRITE_COLS = 6
export const PIG_SPRITE_ROT_STEP = 15

export const PIG_ROW_NORMAL_OPEN = 0
export const PIG_ROW_NORMAL_CLOSED = 1
export const PIG_ROW_HURT_OPEN = 2
export const PIG_ROW_HURT_CLOSED = 3
export const PIG_ROW_DEATH = 4

export const PIG_DEATH_FRAMES = 3
export const PIG_DEATH_FRAME_TIME = 0.1

export const PIG_BLINK_INTERVAL = 0.35

/** Per 15° bucket: sheet col + canvas quarter only (0/90/180/270). Calibrate if needed. */
export const PIG_CAL_COL = [0, 5, 4, 3, 2, 1, 0, 5, 4, 3, 2, 1, 0, 5, 4, 3, 2, 1, 0, 5, 4, 3, 2, 1]
export const PIG_CAL_ROT = [0, 90, 90, 90, 90, 90, 90, 0, 0, 0, 0, 0, 0, 90, 90, 90, 90, 90, 90, 180, 180, 180, 180, 180]

/** PNG art + quarter rotation align with eyes angle (0=right, clockwise). */
export const PIG_SPRITE_DRAW_OFFSET = 0
