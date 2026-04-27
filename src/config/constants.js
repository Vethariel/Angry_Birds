export const INTERNAL_WIDTH = 480
export const INTERNAL_HEIGHT = 270
export const WORLD_WIDTH = INTERNAL_WIDTH * 2.5

export const SKY_HEIGHT      = 256   // altura fija del cielo
export const GROUND_HEIGHT   = 128   // altura fija del suelo
export const WORLD_HEIGHT    = SKY_HEIGHT + GROUND_HEIGHT  // 384

export const SLINGSHOT_HEIGHT   = 80 

export const GROUND_Y        = SKY_HEIGHT   // y donde empieza el suelo (borde superior)

export const SLINGSHOT_X     = 160   // posición fija de la trinchera
export const LEVEL_ORIGIN_X  = INTERNAL_WIDTH * 1.5  // origen X de la estructura del nivel

export const SLING_RADIUS     = 40   // radio máximo de arrastre en coordenadas mundo
export const SLING_POWER      = 0.60 // multiplicador de velocidad al lanzar