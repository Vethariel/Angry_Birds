import { GameState } from "./core/gameState.js";
import { InputManager } from "./core/inputManager.js";
import { SceneManager } from "./core/sceneManager.js";
import { SoundManager } from "./core/soundManager.js";
import { AssetManager } from "./core/assetManager.js";

let sketch = function (p) {

    let sceneManager
    let inputManager
    let gameState
    let soundManager
    let assetManager
    p.setup = async function () {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.style('display', 'block');

        gameState = new GameState()
        inputManager = new InputManager(p)
        soundManager = new SoundManager()
        await soundManager.load(p)
        assetManager = new AssetManager()
        await assetManager.load(p)
        sceneManager = new SceneManager(gameState, inputManager, soundManager)
        sceneManager.transition('splash')
    }
    
    p.draw = function () {
        
        const dt = Math.min(p.deltaTime, 0.05)
        sceneManager.update(dt, p)
        sceneManager.render(p)
        
        p.background(0)
        inputManager.flush()

    }
}

new p5(sketch);