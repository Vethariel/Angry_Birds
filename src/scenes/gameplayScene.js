// scenes/gameplayScene.js
import { World } from "../core/world.js"
import { LevelLoader } from "../levels/levelLoader.js"
import { PhysicsSystem } from "../systems/physicsSystem.js"
import { InputSystem } from "../systems/inputSystem.js"
import { CameraSystem } from "../systems/cameraSystem.js"
import { BirdSystem } from "../systems/birdSystem.js"
import { DamageSystem }     from "../systems/damageSystem.js"
//import { ScoreSystem }    from "../systems/scoreSystem.js"
import { RenderSystem } from "../systems/renderSystem.js"
import { updateImpactParticles } from "../render/birdSpriteRenderer.js"
import { LEVELS } from "../levels/levels.js"

import {
    INTERNAL_WIDTH,
    SLINGSHOT_X,
    IMPACT_EVAL_MIN_DURATION,
    IMPACT_EVAL_MAX_DURATION,
    IMPACT_EVAL_STABLE_SPEED,
    IMPACT_EVAL_STABLE_HOLD,
    DEFEAT_ANTICS_DURATION,
    BIRD_SCORE_COUNT_DURATION,
    BIRD_ALIVE_BONUS,
    VICTORY_CELEBRATION_DURATION,
} from "../config/constants.js"

const STATE = {
    INTRO_PAN: 'INTRO_PAN',
    AIMING: 'AIMING',
    PAN_DRAG: 'PAN_DRAG',
    PULLING: 'PULLING',
    IN_FLIGHT: 'IN_FLIGHT',
    IMPACT_EVAL: 'IMPACT_EVAL',
    RETURN_TO_SLING: 'RETURN_TO_SLING',
    DEFEAT_ANTICS: 'DEFEAT_ANTICS',
    BIRD_SCORE_COUNT: 'BIRD_SCORE_COUNT',
    VICTORY_CELEBRATION: 'VICTORY_CELEBRATION',
}

export class GameplayScene {

    constructor() {
        this.physicsSystem = new PhysicsSystem()
        this.inputSystem = new InputSystem()
        this.cameraSystem = new CameraSystem()
        this.birdSystem = new BirdSystem()
        this.damageSystem    = new DamageSystem()
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

    canPause() {
        if (!this.state) return false
        const pausable = ['AIMING', 'PAN_DRAG', 'PULLING', 'IN_FLIGHT', 'RETURN_TO_SLING']
        return pausable.includes(this.state.name)
    }

    update(dt) {
        if (!this.world) return

        this.world.time += dt
        updateImpactParticles(this.world, dt)

        const frozen = this._isFrozen()

        if (!frozen) {
            this.physicsSystem.update(this.world, dt)
            this.damageSystem.update(this.world, this.physicsSystem)
        }

        let skipBird = false
        if (!frozen && this.world.pigs.length === 0 && !this._victoryWaitsForImpactEval()) {
            skipBird = this._beginVictoryIfCleared() || this._isVictoryFlow()
        }

        const command = frozen || skipBird
            ? null
            : this.inputSystem.update(this.world, this.state, this.inputManager, this.camera)

        if (!frozen && !skipBird) {
            this.birdSystem.update(this.world, this.state, command, dt)
        }

        this.cameraSystem.update(this.world, this.state, this.camera, dt)

        this._tickState(dt, command)
    }

    render(buffer) {
        if (!this.world) return
        const assets = this.manager?.assetManager
        this.renderSystem.render(this.world, this.state, this.camera, buffer, assets)
    }

    // ── Máquina de estados ────────────────────────────────────

    _tickState(dt, command) {
        this.state.timer += dt

        switch (this.state.name) {

            case 'INTRO_PAN':
                if (this.state.timer >= 2.5) this._setState('AIMING')
                break

            case 'AIMING':
                if (this.world.pigs.length === 0) break
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
                this._tickImpactEval(dt)
                if (this._impactEvalComplete()) this._resolveImpact()
                break

            case 'RETURN_TO_SLING':
                // espera a que la cámara llegue antes de activar AIMING
                if (this._cameraAtSlingshot()) this._setState('AIMING')
                break

            case 'DEFEAT_ANTICS':
                if (this.state.timer >= DEFEAT_ANTICS_DURATION && !this.world.defeatOverlayShown) {
                    this.world.defeatOverlayShown = true
                    this.gameState.score = this.world.score
                    this.manager.showOverlay('gameOver')
                }
                break

            case 'BIRD_SCORE_COUNT':
                this._tickBirdScoreCount()
                if (this.state.timer >= BIRD_SCORE_COUNT_DURATION) {
                    this._finishBirdScoreCount()
                    this._setState(STATE.VICTORY_CELEBRATION)
                }
                break

            case 'VICTORY_CELEBRATION':
                if (this.state.timer >= VICTORY_CELEBRATION_DURATION) {
                    this._showVictoryOverlay()
                }
                break
        }
    }

    _isFrozen() {
        return this.state.name === STATE.DEFEAT_ANTICS ||
            this.state.name === STATE.BIRD_SCORE_COUNT ||
            this.state.name === STATE.VICTORY_CELEBRATION
    }

    _isVictoryFlow() {
        return this.state.name === STATE.BIRD_SCORE_COUNT ||
            this.state.name === STATE.VICTORY_CELEBRATION
    }

    /** Last pig can die mid-flight; finish IMPACT_EVAL before win sequence. */
    _victoryWaitsForImpactEval() {
        return this.state.name === STATE.IN_FLIGHT ||
            this.state.name === STATE.IMPACT_EVAL
    }

    _tickImpactEval(dt) {
        if (this.physicsSystem.isWorldStable(this.world, IMPACT_EVAL_STABLE_SPEED)) {
            this.state.stableTimer = (this.state.stableTimer ?? 0) + dt
        } else {
            this.state.stableTimer = 0
        }
    }

    _impactEvalComplete() {
        if (this.state.timer >= IMPACT_EVAL_MAX_DURATION) return true
        if (this.state.timer < IMPACT_EVAL_MIN_DURATION) return false
        return (this.state.stableTimer ?? 0) >= IMPACT_EVAL_STABLE_HOLD
    }

    _resolveImpact() {
        this.birdSystem.retireLaunchedBird(this.world)

        if (this.world.pigs.length === 0) {
            this._beginVictoryIfCleared()
            return
        }

        const birdsWaiting = this.world.birds.length
        const noActive = !this.world.activeBird

        if (birdsWaiting === 0 && noActive) {
            this._setState(STATE.DEFEAT_ANTICS)
        } else {
            this._setState(STATE.RETURN_TO_SLING)
        }
    }

    /** Cola + pájaro en honda sin lanzar. */
    _remainingBirds() {
        let n = this.world.birds.length
        const onSling = this.world.activeBird
        if (onSling && !onSling.launched) n++
        return n
    }

    /**
     * Pigs ya eliminados: celebración si queda algún pájaro (cola o honda), si no overlay directo.
     * @returns {boolean} true para omitir birdSystem este frame
     */
    _collectAliveBirds() {
        const list = [...this.world.birds]
        const onSling = this.world.activeBird
        if (onSling && !onSling.launched) list.push(onSling)
        return list
    }

    _beginVictoryIfCleared() {
        if (this.world.victoryOverlayShown) return true
        if (this._isVictoryFlow()) return false

        this.birdSystem.retireLaunchedBird(this.world)

        if (this._remainingBirds() > 0) {
            this._setState(STATE.BIRD_SCORE_COUNT)
            this.state.birdsToScore = this._collectAliveBirds()
            this.state.birdsScored = 0
            this.state.cameraFromX = this.camera.x
        } else {
            this._showVictoryOverlay()
        }
        return true
    }

    _tickBirdScoreCount() {
        const birds = this.state.birdsToScore
        if (!birds || birds.length === 0) return

        const interval = BIRD_SCORE_COUNT_DURATION / birds.length
        const targetScored = Math.min(
            birds.length,
            Math.floor(this.state.timer / interval) + 1
        )

        while (this.state.birdsScored < targetScored) {
            this.world.score += BIRD_ALIVE_BONUS
            this.state.birdsScored++
        }
    }

    _finishBirdScoreCount() {
        const birds = this.state.birdsToScore
        if (!birds) return
        while (this.state.birdsScored < birds.length) {
            this.world.score += BIRD_ALIVE_BONUS
            this.state.birdsScored++
        }
    }

    _showVictoryOverlay() {
        if (this.world.victoryOverlayShown) return
        this.world.victoryOverlayShown = true
        this.gameState.score = this.world.score
        this.manager.showOverlay('victory')
    }

    _cameraAtSlingshot() {
        const targetX = Math.max(0, SLINGSHOT_X - INTERNAL_WIDTH * 0.3)
        return Math.abs(this.camera.x - targetX) < 2  // dentro de 2px = llegó
    }

    _setState(next) {
        this.state = { name: next, timer: 0, stableTimer: 0 }

        if (next === STATE.DEFEAT_ANTICS && this.world) {
            this.world.pigsLaughing = true
        }
    }
}
