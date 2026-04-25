export class MenuScene {

    constructor() {
        this.blinkTimer = 0
        this.blinkVisible = true
    }

    onEnter() {
        this.gameState.reset()
        //this.soundManager.playMusic('menu')
    }

    update(dt) {
        // Blink
        this.blinkTimer += dt
        if (this.blinkTimer >= 0.5) {
            this.blinkTimer = 0
            this.blinkVisible = !this.blinkVisible
        }

        if (this.inputManager.isJustDown('Enter')) {
            this.manager.transition('levelSelect')
        }
    }

    render(buffer) {
        buffer.background(0)
        buffer.textAlign('center', 'center')

        const cx = buffer.width / 2
        const cy = buffer.height / 2

        // Título
        buffer.fill(255)
        buffer.textSize(16)
        buffer.text('Angry Birds', cx, cy - 10)

        // Press Enter parpadeante
        if (this.blinkVisible) {
            buffer.fill(200)
            buffer.textSize(8)
            buffer.text('PRESS ENTER TO START', cx, cy + 15)
        }
    }

}