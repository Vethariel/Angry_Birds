import { GameState } from "./core/gameState.js";
import { InputManager } from "./core/inputManager.js";
import { SceneManager } from "./core/sceneManager.js";
import { SoundManager } from "./core/soundManager.js";
import { AssetManager } from "./core/assetManager.js";
import { Camera } from "./core/camera.js";
import { INTERNAL_WIDTH, INTERNAL_HEIGHT, WORLD_WIDTH } from "./config/constants.js"

let sketch = function (p) {

    let sceneManager
    let inputManager
    let gameState
    let soundManager
    let assetManager
    let buffer
    let camera

    p.setup = async function () {

        p.pixelDensity(1)
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
        canvas.style('display', 'block')

        canvas.elt.style.imageRendering = 'pixelated'
        p.noSmooth()

        buffer = p.createGraphics(INTERNAL_WIDTH, INTERNAL_HEIGHT)
        buffer.pixelDensity(1)
        buffer.noSmooth()
        buffer.elt.style.imageRendering = 'pixelated'

        camera = new Camera(WORLD_WIDTH, INTERNAL_WIDTH, INTERNAL_HEIGHT)

        gameState = new GameState()
        inputManager = new InputManager(p)
        soundManager = new SoundManager()
        await soundManager.load(p)
        assetManager = new AssetManager()
        await assetManager.load(p)
        sceneManager = new SceneManager(gameState, inputManager, soundManager, camera)
        sceneManager.transition('splash')
    }

    p.draw = function () {

        const dt = Math.min(p.deltaTime / 1000, 0.016)

        const scale = Math.max(1, Math.floor(Math.min(
            p.width / INTERNAL_WIDTH,
            p.height / INTERNAL_HEIGHT
        )))

        const scaledW = INTERNAL_WIDTH * scale
        const scaledH = INTERNAL_HEIGHT * scale

        const offsetX = Math.floor((p.width - scaledW) / 2)
        const offsetY = Math.floor((p.height - scaledH) / 2)

        inputManager.updateMouseWorld(camera, scale, offsetX, offsetY)
        buffer.clear()
        sceneManager.update(dt, p)
        sceneManager.render(buffer)

        p.background(0)
        p.image(buffer, offsetX, offsetY, scaledW, scaledH)
        inputManager.flush()

    }

    p.keyPressed = () => inputManager.onKeyPressed(p.key)
    p.keyReleased = () => inputManager.onKeyReleased(p.key)

    p.mousePressed = () => inputManager.onMousePressed()

    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight)

    p.mousePressed  = () => inputManager.onMousePressed()
    p.mouseReleased = () => inputManager.onMouseReleased()
    p.mouseMoved    = () => inputManager.onMouseMoved(p.mouseX, p.mouseY)
    p.mouseDragged  = () => inputManager.onMouseMoved(p.mouseX, p.mouseY)  // arrastre también

}

new p5(sketch)