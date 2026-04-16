const { Bodies, Engine, World, Events, Body,
    Mouse, MouseConstraint, Constraint } = Matter;

let engine, world, ground,
    boxes = [], bird, pigs = [], slingshot,
    bgImg, boxImg, birdImages = [], pigImg;

// ─── Clases ───────────────────────────────────────────────────────────────────

class Box {
    constructor(p, x, y, w, h, img, options = {}) {
        this.p = p;
        this.w = w;
        this.h = h;
        this.img = img;
        this.body = Bodies.rectangle(x, y, w, h, options);
        World.add(world, this.body);
    }

    show() {
        const p = this.p;
        p.push();
        p.translate(this.body.position.x, this.body.position.y);
        p.rotate(this.body.angle);

        if (this.img) {
            p.imageMode(p.CENTER);
            p.image(this.img, 0, 0, this.w, this.h);
        } else {
            p.rectMode(p.CENTER);
            p.noStroke();
            p.fill(86, 125, 70);
            p.rect(0, 0, this.w, this.h);
        }
        p.pop();
    }
}

class Ground extends Box {
    constructor(p, x, y, w, h, img) {
        super(p, x, y, w, h, img, { isStatic: true });
    }
}

class Animal {
    constructor(p, x, y, r, category, img) {
        this.p = p;
        this.img = img;
        this.body = Bodies.circle(x, y, r, {
            restitution: 0.6,
            collisionFilter: { category: category }
        });
        Body.setMass(this.body, 10);
        World.add(world, this.body);
    }

    show() {
        const p = this.p;
        p.push();
        p.translate(this.body.position.x, this.body.position.y);
        p.rotate(this.body.angle);

        if (this.img) {
            p.imageMode(p.CENTER);
            p.image(this.img, 0, 0,
                2 * this.body.circleRadius,
                2 * this.body.circleRadius);
        } else {
            p.ellipse(0, 0,
                2 * this.body.circleRadius,
                2 * this.body.circleRadius);
        }
        p.pop();
    }
}

class Bird extends Animal {
    constructor(p, x, y, r, img) {
        super(p, x, y, r, 2, img);
    }
}

class Pig extends Animal {
    constructor(p, x, y, r, img) {
        super(p, x, y, r, 1, img);
    }
}

class Slingshot {
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

    fly(mc) {
        if (this.sling.bodyB &&
            mc.mouse.button === -1 &&
            this.sling.bodyB.position.x >
            this.sling.pointA.x + 10) {
            this.sling.bodyB.collisionFilter.category = 1;
            this.sling.bodyB = null;
        }
    }

    hasBird() {
        return this.sling.bodyB != null;
    }

    attach(bird) {
        this.sling.bodyB = bird.body;
    }

    show() {
        if (this.sling.bodyB) {
            const p = this.p;
            p.line(this.sling.pointA.x,
                this.sling.pointA.y,
                this.sling.bodyB.position.x,
                this.sling.bodyB.position.y);
        }
    }
}

// ─── Sketch ───────────────────────────────────────────────────────────────────

let sketch = function (p) {
    p.setup = async function () {
        let canvas = p.createCanvas(800, 560);

        engine = Engine.create();
        world = engine.world;

        const mouse = Mouse.create(canvas.elt);
        mouse.pixelRatio = p.pixelDensity();

        const mc = MouseConstraint.create(engine, {
            mouse: mouse,
            collisionFilter: { mask: 2 }
        });
        World.add(world, mc);

        bgImg = await p.loadImage("assets/sprites/background.jpg");
        boxImg = await p.loadImage("assets/sprites/box.png");
        pigImg = await p.loadImage("assets/sprites/pig.png");
        birdImages = [
            await p.loadImage("assets/sprites/red.png"),
            await p.loadImage("assets/sprites/chuck.png"),
            await p.loadImage("assets/sprites/bomb.png")
        ];

        ground = new Ground(p, p.width / 2, p.height - 10, p.width, 20);

        for (let i = 1; i <= 8; i++) {
            const y = p.height - 50 * i - 10;
            boxes.push(new Box(p, 600, y, 50, 50, boxImg));
            boxes.push(new Box(p, 700, y, 50, 50, boxImg));
        }

        const y = p.height - 50 * 9;
        pigs.push(new Pig(p, 600, y, 25, pigImg));
        pigs.push(new Pig(p, 700, y, 25, pigImg));

        bird = new Bird(p, 150, 450, 25, birdImages[0]);
        slingshot = new Slingshot(p, bird);

        Events.on(engine, "afterUpdate", () => {
            slingshot.fly(mc);
        });
    }

    p.draw = function () {
        p.background(128);
        p.image(bgImg, 0, 0, p.width, p.height);

        Engine.update(engine);

        ground.show();
        for (const box of boxes) box.show();
        for (const pig of pigs) pig.show();

        slingshot.show();
        bird.show();
    }

    p.keyPressed = function () {
        if (p.key === " " && !slingshot.hasBird()) {
            World.remove(world, bird.body);
            let index = p.floor(p.random(0, birdImages.length));
            bird = new Bird(p, 150, 450, 25, birdImages[index]);
            slingshot.attach(bird);
        }
    }
}

new p5(sketch);