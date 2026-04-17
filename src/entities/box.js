export class Box{
    constructor(p, x, y, w, h, img, options = {}) {
        this.p = p;
        this.w = w;
        this.h = h;
        this.img = img;
        this.body = Bodies.rectangle(x, y, w, h, {
            friction: 0.3,
            frictionStatic: 0.5,
            restitution: 0.1,  // menos rebote = menos brinca
            ...options
        });
        World.add(world, this.body);
    }
}