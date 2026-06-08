/** Sound asset paths (keys used by SoundManager). */

export const SOUND_PATHS = {
    birdSelect:    "assets/sounds/bird-01-select.wav",
    birdShot:      "assets/sounds/bird-shot-a1.wav",
    birdNext:      "assets/sounds/bird-next-military-a1.wav",
    birdFlying:    "assets/sounds/bird-01-flying.wav",
    birdCollision: "assets/sounds/bird-01-collision-a4.wav",
    birdDestroyed: "assets/sounds/bird-destroyed.wav",
    blockWood:     "assets/sounds/wood-collision-a1.wav",
    blockIce:      "assets/sounds/ice-light-collision-a1.wav",
    blockStone:    "assets/sounds/rock-collision-a1.wav",
}

export const MUSIC_PATHS = {
    theme:   "assets/sounds/Title_theme.mp3",
    victory: "assets/sounds/level-clear-military-a1.mp3",
    defeat:  "assets/sounds/level-failed-piglets-a1.mp3",
}

export const BLOCK_COLLISION_SFX = {
    wood:  "blockWood",
    ice:   "blockIce",
    stone: "blockStone",
}

/** Minimum relative impact speed to play collision SFX. */
export const SFX_COLLISION_MIN_IMPULSE = 1.8
export const SFX_BIRD_COLLISION_MIN_IMPULSE = 2.2

/** Min seconds between repeated collision sounds (same key). */
export const SFX_COLLISION_COOLDOWN = 0.07

export const SFX_FLYING_VOLUME = 0.35

/** Only these SFX keys may use startLoop/stopLoop. All others are one-shots. */
export const SFX_LOOP_KEYS = new Set(["birdFlying"])

/** Which music tracks loop. Victory/defeat stingers are one-shots. */
export const MUSIC_LOOP = {
    theme:   true,
    victory: false,
    defeat:  false,
}
