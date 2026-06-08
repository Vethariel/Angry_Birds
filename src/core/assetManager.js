export class AssetManager {

    constructor() {
        this.sheets = {}
    }

    async load(p) {
        await this._loadSheet("red", "assets/sprites/red.png", p)
        await this._loadSheet("pig", "assets/sprites/pig.png", p)
        await this._loadSheet("background", "assets/sprites/background.png", p)
        await this._loadSheet("ground", "assets/sprites/ground.png", p)
        await this._loadSheet("slingshot", "assets/sprites/slingshot.png", p)
    }

    async _loadSheet(key, path, p) {
        const img = await p.loadImage(path)
        img.pixelDensity(1)
        if (img.elt) {
            img.elt.style.imageRendering = 'pixelated'
        }
        this.sheets[key] = img
    }

    get(key) {
        return this.sheets[key]
    }

}