// SoundManager — carga y reproduce sonidos con p5.sound v2+ (Tone.js).
// No conoce reglas de juego; solo play/stop/loop/volumen.

import {
    SOUND_PATHS,
    MUSIC_PATHS,
    BLOCK_COLLISION_SFX,
    SFX_COLLISION_MIN_IMPULSE,
    SFX_BIRD_COLLISION_MIN_IMPULSE,
    SFX_COLLISION_COOLDOWN,
    SFX_FLYING_VOLUME,
    SFX_LOOP_KEYS,
    MUSIC_LOOP,
} from "../config/soundConfig.js"

export class SoundManager {

    constructor() {
        this.sfx = {}
        this.music = {}
        this.sfxVolume = 0.8
        this.musicVolume = 0.5
        this.currentMusic = null
        this.overlayMusic = null
        this._loopKey = null
        this._sfxCooldown = {}
        this._p = null
        this._audioUnlocked = false
        /** 'menu' | 'gameplay' — blocks theme from starting during levels. */
        this._scene = "menu"
    }

    bind(p) {
        this._p = p
    }

    /** Must run from a user gesture (splash click, key, etc.) before first playback. */
    unlockAudio() {
        if (this._audioUnlocked) return
        try {
            this._p?.userStartAudio?.()
            const ctx = this._p?.getAudioContext?.()
            if (ctx?.state === "suspended") ctx.resume()
        } catch (_) { /* autoplay policy — retry on next gesture */ }
        this._audioUnlocked = true
    }

    _ensureAudio() {
        if (!this._audioUnlocked) this.unlockAudio()
    }

    async load(p) {
        this.bind(p)

        for (const [key, path] of Object.entries(SOUND_PATHS)) {
            await this._loadSFX(p, key, path)
        }
        for (const [key, path] of Object.entries(MUSIC_PATHS)) {
            await this._loadMusic(p, key, path)
        }

        if (this.sfx.birdFlying) {
            this.sfx.birdFlying.amp(this.sfxVolume * SFX_FLYING_VOLUME)
        }
    }

    async _loadSFX(p, key, path) {
        try {
            this.sfx[key] = await p.loadSound(path)
            if (key !== "birdFlying") {
                this.sfx[key].amp(this.sfxVolume)
            }
        } catch (err) {
            console.warn(`[SoundManager] failed to load SFX "${key}":`, path, err)
            this.sfx[key] = null
        }
    }

    async _loadMusic(p, key, path) {
        try {
            this.music[key] = await p.loadSound(path)
            this.music[key].amp(this.musicVolume)
        } catch (err) {
            console.warn(`[SoundManager] failed to load music "${key}":`, path, err)
            this.music[key] = null
        }
    }

    _valid(sound) {
        return sound && !sound.disposed
    }

    _safeIsPlaying(sound) {
        if (!this._valid(sound)) return false
        try {
            return sound.isPlaying()
        } catch {
            return false
        }
    }

    /** p5.sound v2: always clear loop flag when stopping — it persists on the SoundFile. */
    _resetPlayback(sound) {
        if (!this._valid(sound)) return
        try {
            sound.stop()
            sound.loop(false)
        } catch (_) {}
    }

    /** p5.sound v2: loop() must be set on the node immediately before play(). */
    _playSound(sound, { loop = false, restart = true } = {}) {
        if (!this._valid(sound)) return
        this._ensureAudio()
        if (restart) this._resetPlayback(sound)
        try {
            sound.loop(loop)
            sound.play()
        } catch (err) {
            console.warn("[SoundManager] play failed:", err)
        }
    }

    playSFX(key, { restart = true } = {}) {
        if (SFX_LOOP_KEYS.has(key)) return
        this._playSound(this.sfx[key], { loop: false, restart })
    }

    _canPlay(key, cooldown = SFX_COLLISION_COOLDOWN) {
        const now = performance.now() / 1000
        const last = this._sfxCooldown[key] ?? 0
        if (now - last < cooldown) return false
        this._sfxCooldown[key] = now
        return true
    }

    playBirdCollision(impulse) {
        if (impulse < SFX_BIRD_COLLISION_MIN_IMPULSE) return
        if (!this._canPlay("birdCollision")) return
        this.playSFX("birdCollision")
    }

    playBlockCollision(blockType, impulse) {
        if (impulse < SFX_COLLISION_MIN_IMPULSE) return
        const key = BLOCK_COLLISION_SFX[blockType]
        if (!key) return
        if (!this._canPlay(key)) return
        this.playSFX(key)
    }

    startLoop(key) {
        if (!SFX_LOOP_KEYS.has(key)) return
        const sound = this.sfx[key]
        if (!sound) return
        if (this._loopKey === key && this._safeIsPlaying(sound)) return
        this.stopLoop()
        this._playSound(sound, { loop: true, restart: true })
        this._loopKey = key
    }

    stopLoop() {
        if (!this._loopKey) return
        this._resetPlayback(this.sfx[this._loopKey])
        this._loopKey = null
    }

    playMusic(key, loop = MUSIC_LOOP[key] ?? false) {
        if (this._scene === "gameplay" && key === "theme") return

        const track = this.music[key]
        if (!track) return

        if (key === "theme") {
            this._scene = "menu"
        }

        if (this.currentMusic && this.currentMusic !== track) {
            this._resetPlayback(this.currentMusic)
        } else if (this.currentMusic === track && this._safeIsPlaying(track)) {
            return
        }

        this._playSound(track, { loop, restart: true })
        this.currentMusic = track
    }

    stopMusic() {
        this._resetPlayback(this.currentMusic)
        this.currentMusic = null
    }

    /** Stop every music track — used when leaving menu/level select. */
    stopAllMusic() {
        for (const track of Object.values(this.music)) {
            this._resetPlayback(track)
        }
        this.currentMusic = null
        this.overlayMusic = null
    }

    /** Level start — silence menu theme (called from gameplayScene.onEnter). */
    enterGameplay() {
        this._scene = "gameplay"
        this.stopLoop()
        this.stopAllMusic()
        // p5.sound v2: play() scheduled before stop() can still audibly start
        queueMicrotask(() => {
            if (this._scene === "gameplay") {
                this._resetPlayback(this.music.theme)
            }
        })
    }

    isOverlayPlaying(key) {
        const track = this.music[key]
        return track && this.overlayMusic === track && this._safeIsPlaying(track)
    }

    playOverlayMusic(key, loop = MUSIC_LOOP[key] ?? false) {
        const track = this.music[key]
        if (!track || this.isOverlayPlaying(key)) return
        this._resetPlayback(this.overlayMusic)
        this._playSound(track, { loop, restart: true })
        this.overlayMusic = track
    }

    stopOverlayMusic() {
        this._resetPlayback(this.overlayMusic)
        this.overlayMusic = null
    }

    setSFXVolume(v) {
        this.sfxVolume = v
        for (const [key, s] of Object.entries(this.sfx)) {
            if (!this._valid(s)) continue
            const scale = key === "birdFlying" ? SFX_FLYING_VOLUME : 1
            s.amp(v * scale)
        }
    }

    setMusicVolume(v) {
        this.musicVolume = v
        for (const m of Object.values(this.music)) {
            if (this._valid(m)) m.amp(v)
        }
    }

    pauseMusic() {
        if (!this._valid(this.currentMusic)) return
        try {
            this.currentMusic.pause()
        } catch (_) {}
    }

    resumeMusic() {
        if (!this._valid(this.currentMusic)) return
        try {
            const loop = MUSIC_LOOP[this._musicKey(this.currentMusic)] ?? false
            this.currentMusic.loop(loop)
            this.currentMusic.play()
            this.currentMusic.paused = false
        } catch (_) {}
    }

    _musicKey(track) {
        for (const [key, t] of Object.entries(this.music)) {
            if (t === track) return key
        }
        return null
    }

}
