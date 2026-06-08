// config/entityConfig.js

export const BIRD_TYPES = {
    red: {
        radius:      8.5,   // 17px diameter hit circle
        spriteSize:  33,
        mass:        1.5,
        restitution: 0.3,
        friction:        0.5,
        frictionStatic:  0.35,
        frictionAir:     0.01,
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
        radius: 9.5,   // 19px diameter hit circle
        spriteSize: 33,
        hp:     10,
        score:  500,
        damageThresh: 0.1,
        fallImpulseMult: 10,
    },
    medium: {
        radius: 14,
        spriteSize: 33,
        hp:     80,
        score:  1000,
        damageThresh: 3,
        fallImpulseMult: 8,
    },
    helmet: {
        radius: 14,
        spriteSize: 33,
        hp:     160,
        score:  2000,
        damageThresh: 5,
        fallImpulseMult: 6,
    },
    king: {
        radius: 16,
        spriteSize: 33,
        hp:     300,
        score:  5000,
        damageThresh: 8,
        fallImpulseMult: 5,
    },
}

/** Default impulse scale for pig vs bird direct hit (impulse × mult + bird damage). */
export const PIG_BIRD_IMPULSE_MULT = 4

export const BLOCK_TYPES = {
    // Wood = reference (1×). Other materials scale from these values.
    wood: {
        density:       0.002,
        restitution:   0.3,
        friction:      0.6,
        hp:            35,
        damageThresh:  1,
        score:         100,
    },
    // Ice — 0.5× mass, ~0.45× hp, 0.5× damage thresh, 1.5× score; slippery, bouncy, fragile
    ice: {
        density:       0.001,   // 0.5× wood
        restitution:   0.45,    // 1.5× wood
        friction:      0.1,     // ~0.17× wood
        hp:            16,      // ~0.45× wood
        damageThresh:  0.5,     // 0.5× wood — breaks easier
        score:         150,     // 1.5× wood
    },
    // Stone — 2.5× mass, 5× hp, 5× damage thresh, 2× score; heavy, stable, tough
    stone: {
        density:       0.005,   // 2.5× wood
        restitution:   0.2,     // ~0.67× wood
        friction:      0.8,     // ~1.33× wood
        hp:            175,     // 5× wood
        damageThresh:  5,       // 5× wood
        score:         200,     // 2× wood
    },
}