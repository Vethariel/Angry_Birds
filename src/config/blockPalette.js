// Three related shades per material — only these RGB values are written to pixels.

export const BLOCK_PALETTES = {
    wood: {
        dark:  [92, 58, 34],
        mid:   [156, 108, 68],
        light: [196, 152, 104],
    },
    ice: {
        dark:  [72, 116, 152],
        mid:   [168, 208, 232],
        light: [220, 236, 248],
    },
    stone: {
        dark:  [88, 84, 80],
        mid:   [148, 144, 136],
        light: [192, 188, 180],
    },
}

export function blockDamageTier(hp, maxHp) {
    const ratio = maxHp > 0 ? hp / maxHp : 0
    if (ratio > 0.66) return 0
    if (ratio > 0.33) return 1
    return 2
}

