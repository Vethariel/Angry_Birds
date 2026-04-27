import { MenuScene } from "../scenes/menuScene.js"
import { LevelSelectScene } from "../scenes/levelSelectScene.js"
import { GameplayScene } from "../scenes/gameplayScene.js"
//import { GameOverScene } from "../scenes/gameOverScene.js"
//import { TimeUpOverlay } from "../scenes/timeUpOverlay.js"
//import { PauseOverlay } from "../scenes/pauseOverlay.js"
//import { VictoryOverlay } from "../scenes/victoryOverlay.js"
//import { LevelIntroOverlay } from "../scenes/levelIntroOverlay.js"
import { SplashScene } from "../scenes/splashScene.js"

export class SceneManager {

    constructor(gameState, inputManager, soundManager, camera) {

        this.gameState = gameState
        this.inputManager = inputManager
        this.soundManager = soundManager
        this.camera = camera
        this.current = null
        this.overlay = null

        this.scenes = {
            menu: new MenuScene(),
            levelSelect: new LevelSelectScene(),
            gameplay: new GameplayScene(),
            //gameOver: new GameOverScene(),
            //minigame:    new MinigameScene(),
            //timeUp: new TimeUpOverlay(),
            //pause: new PauseOverlay(),
            //victory: new VictoryOverlay(),
            //levelIntro: new LevelIntroOverlay(),
            splash: new SplashScene(),
        }

        for (const scene of Object.values(this.scenes)) {
            scene.manager = this
            scene.gameState = gameState
            scene.inputManager = inputManager
            scene.soundManager = soundManager
            scene.camera = camera
        }

    }

    transition(name, data = {}) {
        this.overlay = null
        this.current?.onExit?.()
        this.current = this.scenes[name]
        this.current?.onEnter?.(data)
    }

    showOverlay(name, data = {}) {
        //this.soundManager.pauseMusic()
        this.overlay = this.scenes[name]
        this.overlay?.onEnter?.(data)
    }

    hideOverlay() {
        //this.soundManager.resumeMusic()
        this.overlay?.onExit?.()
        this.overlay = null
    }

    update(dt, p) {

        // Input global — ESC para pausa
        if (this.inputManager.isJustDown('Escape') &&
            !this.overlay &&
            this.current === this.scenes['gameplay']) {
            this.showOverlay('pause')
            return
        }

        if (this.overlay) {
            this.overlay.update?.(dt, p)
        } else {
            this.current?.update?.(dt, p)
        }

    }

    render(buffer) {
        this.current?.render?.(buffer)
        this.overlay?.render?.(buffer)
    }

}