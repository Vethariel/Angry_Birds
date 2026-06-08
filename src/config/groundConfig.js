// ground.png — 224×384: three 128px-tall strips stacked vertically

export const GROUND_SHEET_WIDTH = 224
export const GROUND_LAYER_HEIGHT = 128

/** Soil / underground — top of strip meets ground line, repeats downward. */
export const GROUND_UNDERGROUND_SRC_Y = 0

/** Tall grass — anchored at ground line, extends upward. */
export const GROUND_TALL_GRASS_SRC_Y = 128

/** Short grass — foreground layer, drawn after characters. */
export const GROUND_SHORT_GRASS_SRC_Y = 256

/** Pixels below ground line where short grass bottom sits. */
export const GROUND_SHORT_GRASS_Y_OFFSET = 6

/** Scrolls with the world (same speed as blocks). */
export const GROUND_PARALLAX = 1

/** Fallback fill below ground if sheet missing. */
export const GROUND_FILL = [80, 140, 60]
