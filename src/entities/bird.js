export class Bird{

    constructor (p, x, y, r, mass) {
        this.p = p;
        this.body = Bodies.circle(x, y, r, {
            restitution: 0.6,
            collisionFilter: { category: 2 }
        });
        Body.setMass(this.body, mass);
    }
}