export class Pig{
    constructor(p, x, y, r, mass, img) {
        this.p = p;
        this.body = Bodies.circle(x, y, r, {
            restitution: 0.6,
            collisionFilter: { category: 2 }
        });
        Body.setMass(this.body, mass);
        this.img = img;
    }
}