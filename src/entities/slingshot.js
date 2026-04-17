export class Slingshot {
    constructor(p, bird) {
        this.p = p;
        this.sling = Constraint.create({
            pointA: {
                x: bird.body.position.x,
                y: bird.body.position.y
            },
            bodyB: bird.body,
            length: 5,
            stiffness: 0.05,
            damping: 0.05
        });
        World.add(world, this.sling);
    }
}