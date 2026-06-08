# Angry Birds (fan clone)

Clon educativo no oficial de **Angry Birds**, hecho en JavaScript con física 2D, sprites pixel-art y sonido.

> **Aviso:** Este proyecto **no está afiliado, respaldado ni patrocinado por Rovio Entertainment**.  
> *Angry Birds* y los assets relacionados son propiedad de [Rovio Entertainment Corporation](https://www.rovio.com/).  
> Se trata de un fan project con fines de aprendizaje y demostración técnica.

## Características

- Lanzamiento con honda, física Matter.js y destrucción por materiales (madera, hielo, piedra)
- Sprites pixel-perfect con rotación por cuartos de vuelta
- Parallax de cielo y suelo, honda en capas y césped en primer plano
- Sistema de puntuación, niveles, menú con scroll y selección de nivel
- Audio con p5.sound v2+ (SFX y música contextual)

## Requisitos

- Navegador moderno con soporte ES modules
- Servidor HTTP local (los módulos y assets no cargan bien con `file://`)

## Cómo ejecutar

```bash
# Desde la raíz del proyecto
python -m http.server 5500
# o con la extensión Live Server de VS Code / Cursor en index.html
```

Abre `http://127.0.0.1:5500` (o el puerto que uses) y pulsa **Click to start** en la pantalla inicial.

## Controles

| Acción | Entrada |
|--------|---------|
| Menú / splash / overlays | **Ratón** (clic en botones y fichas) |
| Selección de nivel | Clic en ficha → **PLAY** |
| Apuntar y lanzar | Arrastrar desde la honda |
| Pausa (en nivel) | `Escape` |

## Stack

- [p5.js](https://p5js.org/) 2.x — render y carga de assets
- [p5.sound](https://github.com/processing/p5.sound.js) — audio
- [Matter.js](https://brm.io/matter-js/) — física
- JavaScript ES modules, sin bundler

## Estructura

```
src/
  scenes/       Menú, gameplay, overlays
  systems/      Física, pájaros, cámara, sonido, render
  render/       Sprites, parallax, UI, honda
  config/       Constantes y datos de entidades
  levels/       Definición de niveles
assets/
  sprites/      Imágenes del juego
  sounds/       Efectos y música
```

## Créditos y assets de terceros

### Código fuente

El código de este repositorio se distribuye bajo la **MIT License** — ver [LICENSE](LICENSE).  
Copyright © 2026 Daniel Gracia.

### Sonido

Los archivos en `assets/sounds/` son **efectos y música originales de Angry Birds** (propiedad de **Rovio Entertainment**).  
No se reclama propiedad sobre ellos; se usan en este fan project solo con fines educativos.

### Sprites — pájaro rojo

El sprite de **Red** (`assets/sprites/red.png`) está **inspirado** en el estilo SMB3 de MasterDarkar:

- [Angry Birds Classic/Space In SMB3 and SMAS SMB3](https://www.deviantart.com/masterdarkar/art/Angry-Birds-Classic-Space-In-SMB3-and-SMAS-SMB3-1045538223) por [MasterDarkar](https://www.deviantart.com/masterdarkar) en DeviantArt

Crédito al autor si reutilizas o redistribuyes ese arte.

### Sprites — escenario

Los sprites de **fondo** (`background.png`), **suelo** (`ground.png`) y **honda** (`slingshot.png`) están **inspirados en el juego original Angry Birds** (Rovio). Son recreaciones pixel-art para este proyecto; los derechos de la obra original pertenecen a Rovio.

### Otros sprites

Cerdo, bloques y demás gráficos de gameplay son arte del proyecto o adaptaciones con el mismo criterio fan/educativo. Consulta los archivos en `assets/sprites/` antes de redistribuir.

## Licencia

| Contenido | Licencia |
|-----------|----------|
| Código en `src/`, `css/`, `index.html` | [MIT](LICENSE) |
| Sonidos en `assets/sounds/` | © Rovio — **no incluidos** en la MIT |
| Sprites en `assets/sprites/` | Ver sección **Créditos**; **no incluidos** en la MIT |

Si publicas o compartes este repositorio, **no elimines** este README ni los avisos de atribución.  
La redistribución comercial de assets de Rovio puede infringir sus derechos de autor y marcas registradas.
