// background.png — 416×512: far layer y=0..255, near layer y=256..511 (each 256px tall)

export const BG_SHEET_WIDTH = 416
export const BG_LAYER_HEIGHT = 256
export const BG_FAR_SRC_Y = 0
export const BG_NEAR_SRC_Y = 256

/** Horizontal scroll factor relative to camera.x (0 = fixed, 1 = moves with world). */
export const BG_PARALLAX_FAR = 0.22
export const BG_PARALLAX_NEAR = 0.5

/** Fill above layers when the 256px band does not reach y=0. */
export const BG_SKY_FILL = [135, 206, 235]
