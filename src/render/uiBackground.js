import { GROUND_Y } from "../config/constants.js"
import { drawParallaxBackground } from "./backgroundParallax.js"
import {
    drawGroundUnderground,
    drawGroundTallGrass,
    drawGroundShortGrass,
} from "./groundParallax.js"
import { MENU_SCROLL_SPEED } from "../config/uiConfig.js"

const MENU_WORLD = { groundY: GROUND_Y }

export function tickMenuScroll(scrollX, dt) {
    return scrollX + MENU_SCROLL_SPEED * dt
}

export function drawMenuScrollingWorld(buffer, assets, scrollX) {
    const camera = { x: scrollX, y: 0 }
    drawParallaxBackground(buffer, assets, MENU_WORLD, camera)
    drawGroundUnderground(buffer, assets, MENU_WORLD, camera)
    drawGroundTallGrass(buffer, assets, MENU_WORLD, camera)
    drawGroundShortGrass(buffer, assets, MENU_WORLD, camera)
}
