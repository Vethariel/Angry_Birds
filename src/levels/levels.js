// levels/levels.js
import { SKY_HEIGHT, GROUND_HEIGHT, INTERNAL_HEIGHT } from "../config/constants.js"

// levels/levels.js
export const LEVELS = [
    {
        name:    'First flight',
        cameraY: 70,
        birds:   ['red', 'red', 'blue'],
        pigs: [
            { type: 'small', x: 180,  y: 0 },
            { type: 'small', x: 240, y: 0 },
        ],
        blocks: [
            { type: 'wood', x1: 146,  y1: 0, x2: 154,  y2: 60 },  // columna izquierda
            { type: 'wood', x1: 266, y1: 0, x2: 274, y2: 60 },  // columna derecha
            { type: 'wood', x1: 146,  y1: 60, x2: 274, y2: 68 }, // viga
        ],
    },
]