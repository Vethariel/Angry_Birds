// scenes/gameplayScene.js
import { World } from "../core/world.js"
import { LevelLoader } from "../levels/levelLoader.js"
import { PhysicsSystem } from "../systems/physicsSystem.js"
import { InputSystem } from "../systems/inputSystem.js"
import { CameraSystem } from "../systems/cameraSystem.js"
import { BirdSystem } from "../systems/birdSystem.js"
//import { LifeSystem }     from "../systems/lifeSystem.js"
//import { ScoreSystem }    from "../systems/scoreSystem.js"
import { RenderSystem } from "../systems/renderSystem.js"
import { LEVELS } from "../levels/levels.js"

const STATE = {
    INTRO_PAN: 'INTRO_PAN',
    AIMING: 'AIMING',
    PAN_DRAG: 'PAN_DRAG',
    PULLING: 'PULLING',
    IN_FLIGHT: 'IN_FLIGHT',
    IMPACT_EVAL: 'IMPACT_EVAL',
    SCORE_TALLY: 'SCORE_TALLY',
}

export class GameplayScene {

    constructor() {
        this.physicsSystem = new PhysicsSystem()
        this.inputSystem = new InputSystem()
        this.cameraSystem = new CameraSystem()
        this.birdSystem = new BirdSystem()
        //this.lifeSystem    = new LifeSystem()
        //this.scoreSystem   = new ScoreSystem()
        this.renderSystem = new RenderSystem()
        this.levelLoader = new LevelLoader()

        this.world = null
        this.state = null
    }

    onEnter() {
        this.world = new World()
        this.levelLoader.load(LEVELS[this.gameState.currentLevelIndex], this.world)
        this.physicsSystem.mount(this.world)
        this.camera.y = this.world.cameraY
        this._setState(STATE.INTRO_PAN)
    }

    onExit() {
        this.physicsSystem.unmount(this.world)
        this.world = null
    }

    update(dt) {
        if (!this.world) return

        this.physicsSystem.update(this.world, dt)
        const command = this.inputSystem.update(this.world, this.state, this.inputManager, this.camera)
        this.birdSystem.update(this.world, this.state, command, dt)
        this.cameraSystem.update(this.world, this.state, this.camera, dt)
        //this.lifeSystem.update(this.world, this.state)
        //this.scoreSystem.update(this.world, this.state)

        this._tickState(dt, command)
        this._handleTransitions()
    }

    render(buffer) {
        if (!this.world) return
        this.renderSystem.render(this.world, this.state, this.camera, buffer)
    }

    // ── Máquina de estados ────────────────────────────────────

    _setState(next) {
        this.state = { name: next, timer: 0 }
    }

    _tickState(dt, command) {
        this.state.timer += dt

        switch (this.state.name) {

            case 'INTRO_PAN':
                if (this.state.timer >= 2.5) this._setState('AIMING')
                break

            case 'AIMING':
                if (command?.type === 'START_PULLING') this._setState('PULLING')
                if (command?.type === 'START_PAN_DRAG') this._setState('PAN_DRAG')
                break

            case 'PAN_DRAG':
                if (command?.type === 'END_PAN_DRAG') this._setState('AIMING')
                break

            case 'PULLING':
                if (command?.type === 'RELEASE') this._setState('IN_FLIGHT')
                break

            case 'IN_FLIGHT':
                if (this.world.activeBird?.dead) this._setState('IMPACT_EVAL')
                break

            case 'IMPACT_EVAL':
                if (this.state.timer >= 1.5) this._resolveImpact()
                break

            case 'SCORE_TALLY':
                if (this.state.timer >= 3.0) this.world.gameWon = true
                break
        }
    }

    _resolveImpact() {
        if (this.world.pigsAlive === 0) {
            this._setState(STATE.SCORE_TALLY)
        } else if (this.world.birdsLeft === 0) {
            this.world.gameOver = true
        } else {
            this._setState(STATE.AIMING)
        }
    }

    _handleTransitions() {
        if (this.world.gameOver) {
            this.gameState.syncScore(this.world.score)
            this.manager.transition('gameOver')
        }
        if (this.world.gameWon) {
            this.gameState.syncScore(this.world.score)
            this.gameState.nextLevel()
            this.gameState.save()
            this.manager.showOverlay('victory')
            this.world.gameWon = false
        }
    }
}