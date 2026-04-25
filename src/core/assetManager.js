export class AssetManager {

    constructor() {
        this.sheets = {}
    }

    async load(p) {
        await this._loadSheet("red", "assets/sprites/red.png", p)
    }

    async _loadSheet(key, path, p) {
        this.sheets[key] = await p.loadImage(path)
    }

    get(key) {
        return this.sheets[key]
    }

}