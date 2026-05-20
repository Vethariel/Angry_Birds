export class AssetManager {

    constructor() {
        this.sheets = {}
    }

    async load(p) {
        await this._loadSheet("red", "assets/sprites/red.png", p)
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