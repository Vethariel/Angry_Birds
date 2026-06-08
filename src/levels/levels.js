// levels/levels.js
// Coords: x/y relative to LEVEL_ORIGIN_X and ground line (y grows upward).
// blocks: x1,y1 bottom-left → x2,y2 top-right

export const LEVELS = [
    {
        name: "First Flight",
        cameraY: 70,
        birds: ["red", "red", "red"],
        pigs: [
            { type: "small", x: 210, y: 56 },
        ],
        blocks: [
            { type: "wood", x1: 155, y1: 0, x2: 163, y2: 48 },
            { type: "wood", x1: 265, y1: 0, x2: 273, y2: 48 },
            { type: "wood", x1: 155, y1: 48, x2: 273, y2: 56 },
        ],
    },
    {
        name: "Ice Towers",
        cameraY: 65,
        birds: ["red", "red", "red"],
        pigs: [
            { type: "small", x: 140, y: 40 },
            { type: "small", x: 270, y: 40 },
        ],
        blocks: [
            { type: "wood", x1: 118, y1: 0, x2: 126, y2: 32 },
            { type: "wood", x1: 150, y1: 0, x2: 158, y2: 32 },
            { type: "ice",  x1: 118, y1: 32, x2: 158, y2: 40 },

            { type: "wood", x1: 248, y1: 0, x2: 256, y2: 32 },
            { type: "wood", x1: 280, y1: 0, x2: 288, y2: 32 },
            { type: "ice",  x1: 248, y1: 32, x2: 288, y2: 40 },

            { type: "ice", x1: 158, y1: 20, x2: 248, y2: 28 },
        ],
    },
    {
        name: "Stone Keep",
        cameraY: 60,
        birds: ["red", "red", "red"],
        pigs: [
            { type: "small", x: 205, y: 32 },
            { type: "small", x: 160, y: 80 },
            { type: "small", x: 250, y: 80 },
        ],
        blocks: [
            { type: "stone", x1: 100, y1: 0, x2: 108, y2: 32 },
            { type: "stone", x1: 302, y1: 0, x2: 310, y2: 32 },
            { type: "stone", x1: 100, y1: 32, x2: 310, y2: 40 },

            { type: "wood", x1: 128, y1: 40, x2: 136, y2: 72 },
            { type: "wood", x1: 274, y1: 40, x2: 282, y2: 72 },
            { type: "wood", x1: 128, y1: 72, x2: 282, y2: 80 },

            { type: "stone", x1: 188, y1: 40, x2: 196, y2: 56 },
            { type: "stone", x1: 214, y1: 40, x2: 222, y2: 56 },
        ],
    },
]
