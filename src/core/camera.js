// core/camera.js
export class Camera {
  constructor(worldWidth, viewW, viewH) {
    this.x = 0           // borde izquierdo del viewport en coordenadas mundo
    this.y = 0           // normalmente 0 (no scrollea vertical)
    this.worldWidth = worldWidth
    this.viewW = viewW
    this.viewH = viewH
  }

  // La escena llama esto cada frame con la posición del objetivo (pájaro, etc.)
  follow(targetX, targetY = null) {
    // Centrar horizontalmente sobre el objetivo
    this.x = targetX - this.viewW / 2

    // Clamp: no salir del mundo
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.viewW))

    // Vertical fijo por ahora (el cielo simplemente es parte del buffer)
    // Si en algún momento querés scroll vertical, descomentá:
    // this.y = targetY - this.viewH * 0.7  // horizonte bajo
  }

  // Convierte coordenada mundo → coordenada buffer para dibujar
  toScreen(worldX, worldY = 0) {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    }
  }

  // Culling: ¿vale la pena dibujar este objeto?
  isVisible(worldX, worldY, w = 0, h = 0) {
    return (
      worldX + w > this.x &&
      worldX     < this.x + this.viewW &&
      worldY + h > this.y &&
      worldY     < this.y + this.viewH
    )
  }

  clamp() {
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.viewW))
  }
}