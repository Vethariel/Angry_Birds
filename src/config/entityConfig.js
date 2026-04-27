// config/entityConfig.js

export const BIRD_TYPES = {
    red: {
        radius:      8,
        mass:        1.5,
        restitution: 0.3,
        damage:      20,    // daño base al impactar
    },
    blue: {
        radius:      6,
        mass:        1.0,
        restitution: 0.4,
        damage:      12,
    },
    yellow: {
        radius:      7,
        mass:        1.2,
        restitution: 0.2,
        damage:      18,
        hasAbility:  true,  // aceleración al hacer clic en vuelo
    },
    black: {
        radius:      10,
        mass:        3.0,
        restitution: 0.1,
        damage:      50,
        hasAbility:  true,  // explosión
        fuseTime:    1.5,   // segundos antes de explotar tras impacto
    },
}

export const PIG_TYPES = {
    small: {
        radius: 10,
        hp:     40,
        score:  500,
    },
    medium: {
        radius: 14,
        hp:     80,
        score:  1000,
    },
    helmet: {
        radius: 14,
        hp:     160,
        score:  2000,
    },
    king: {
        radius: 16,
        hp:     300,
        score:  5000,
    },
}

export const BLOCK_TYPES = {
    // material define resistencia y umbral de daño
    wood: {
        density:       0.002,
        restitution:   0.3,
        friction:      0.6,
        hp:            60,
        damageThresh:  4,    // impulso mínimo para recibir daño
        score:         100,
    },
    ice: {
        density:       0.001,
        restitution:   0.5,
        friction:      0.1,
        hp:            30,
        damageThresh:  2,
        score:         150,
    },
    stone: {
        density:       0.005,
        restitution:   0.2,
        friction:      0.8,
        hp:            200,
        damageThresh:  10,
        score:         200,
    },
}