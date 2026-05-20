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

export const SLING_RADIUS     = 50   // radio máximo de arrastre en coordenadas mundo
export const SLING_POWER      = 0.25 // multiplicador de velocidad al lanzar

// Cola de pájaros (mundo, a la izquierda / detrás de la honda)
export const QUEUE_OFFSET_X   = 32   // px a la izquierda del anclaje de la honda
export const QUEUE_GAP        = 6    // espacio entre pájaros en cola

// Cuándo se da por terminado el vuelo del pájaro (lo primero que ocurra)
export const BIRD_SETTLE_MIN_TIME       = 0.4   // s mínimos antes de evaluar reposo/lejos
export const BIRD_SETTLE_MAX_TIME       = 10    // s máximo en vuelo
export const BIRD_SETTLE_STOP_SPEED     = 0.35  // velocidad considerada "parado"
export const BIRD_SETTLE_STOP_HOLD      = 0.5   // s seguidos por debajo de STOP_SPEED
export const BIRD_SETTLE_CLEAR_DIST     = 100   // px al bloque/cerdo más cercano = "lejos"

export const IMPACT_EVAL_MIN_DURATION     = 3   // s mínimo tras impacto
export const IMPACT_EVAL_MAX_DURATION     = 7   // s máximo aunque siga inestable
export const IMPACT_EVAL_STABLE_SPEED     = 0.4 // velocidad máxima para “estable”
export const IMPACT_EVAL_STABLE_HOLD      = 0.35 // s seguidos estables tras el mínimo

export const DEFEAT_ANTICS_DURATION      = 2  // s cámara en estructura antes del overlay derrota
export const BIRD_SCORE_COUNT_DURATION    = 2  // s en honda, sumar bonus por pájaro vivo
export const BIRD_ALIVE_BONUS           = 5000 // puntos por cada pájaro restante
export const BIRD_SCORE_CAM_TRAVEL        = 1  // s paneo a la honda para contar pájaros

export const VICTORY_CELEBRATION_DURATION = 2  // s en honda antes del overlay victoria