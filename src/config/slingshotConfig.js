// slingshot.png — 32×224: two 112px-tall layers stacked vertically

export const SLINGSHOT_SHEET_WIDTH = 32
export const SLINGSHOT_LAYER_HEIGHT = 112

/** Image 2 — upper half, drawn behind the bird. */
export const SLINGSHOT_BACK_SRC_Y = 0

/** Image 1 — lower half, drawn in front of the bird. */
export const SLINGSHOT_FRONT_SRC_Y = 112

/** Horizontal offset from slingshot center to each fork anchor (px). */
export const SLINGSHOT_BAND_OFFSET = 12

/** Half-width of each band strip in pixels (1 → 2px thick line). */
export const SLINGSHOT_BAND_HALF_WIDTH = 1

/** #331100 — elastic bands and bird seat. */
export const SLINGSHOT_BAND_PALETTE = {
    dark:  [51, 17, 0],
    mid:   [51, 17, 0],
    light: [51, 17, 0],
}
