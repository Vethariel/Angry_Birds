import { MenuScene } from "../scenes/menuScene.js"
import { LevelSelectScene } from "../scenes/levelSelectScene.js"
import { GameplayScene } from "../scenes/gameplayScene.js"
import { PauseOverlay } from "../scenes/pauseOverlay.js"
import { GameOverOverlay } from "../scenes/gameOverOverlay.js"
import { VictoryOverlay } from "../scenes/victoryOverlay.js"
//import { LevelIntroOverlay } from "../scenes/levelIntroOverlay.js"
import { SplashScene } from "../scenes/splashScene.js"

export class SceneManager {

    constructor(gameState, inputManager, soundManager, camera, assetManager) {

        this.gameState = gameState
        this.inputManager = inputManager
        this.soundManager = soundManager
        this.camera = camera
        this.assetManager = assetManager
        this.current = null
        this.overlay = null

        this.scenes = {
            menu: new MenuScene(),
            levelSelect: new LevelSelectScene(),
            gameplay: new GameplayScene(),
            pause: new PauseOverlay(),
            gameOver: new GameOverOverlay(),
            victory: new VictoryOverlay(),
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

        if (this.overlay) {
            this.overlay.update?.(dt, p)
            return
        }

        if (this.inputManager.isJustDown('Escape') &&
            this.current === this.scenes['gameplay'] &&
            this.scenes['gameplay'].canPause?.()) {
            this.showOverlay('pause')
            return
        }

        this.current?.update?.(dt, p)

    }

    render(buffer) {
        this.current?.render?.(buffer)
        this.overlay?.render?.(buffer)
    }

}