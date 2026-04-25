const SAVE_KEY = 'angry-birds-save'

export class GameState {

    constructor() {
        this.reset()
        this.unlockedLevels = 1
    }

    reset() {
        this.currentLevelIndex = 0
        this.score             = 0
    }

    // Aplica el estado persistido al jugador al iniciar un nivel
    applyToPlayer(player) {
        player.score     = this.score
    }

    // Sincroniza de vuelta desde el jugador al terminar un nivel
    syncFromPlayer(player) {
        this.score     = player.score
    }

    nextLevel() {
        this.currentLevelIndex++
        this.unlockedLevels = Math.max(this.unlockedLevels, this.currentLevelIndex + 1)
    }

    hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null
    }

    save() {
        const data = {
            currentLevelIndex: this.currentLevelIndex,
            score:             this.score,
            unlockedLevels:    this.unlockedLevels
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    }

    load() {
        const raw = localStorage.getItem(SAVE_KEY)
        if (!raw) return false

        try {
            const data = JSON.parse(raw)
            this.currentLevelIndex = data.currentLevelIndex ?? 0
            this.score             = data.score             ?? 0
            this.unlockedLevels    = data.unlockedLevels    ?? 1
            return true
        } catch {
            return false
        }
    }

    deleteSave() {
        localStorage.removeItem(SAVE_KEY)
    }

}