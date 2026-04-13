// Box
class Box {
  constructor(x, y, w, h, img, options={}){
    this.w = w;
    this.h = h;
    this.img = img;
    this.body = Bodies.rectangle(x, y, w, h, options);
    
    World.add(world, this.body);
  }
  
  show(){
    push();
    translate(this.body.position.x,
      this.body.position.y);
    rotate(this.body.angle);
    
    if (this.img) {
      imageMode(CENTER);
      image(this.img, 0, 0, this.w, this.h);

    } else {
      rectMode(CENTER);
      noStroke();
      fill(86, 125, 70);
      rect(0, 0, this.w, this.h);
    }
    pop();
  }
}

// Ground
class Ground extends Box {
  constructor(x, y, w, h, img){
    super(x, y, w, h, img, {
      isStatic: true
    });
  }
}

class Animal {
  
  constructor(x, y, r, category, img){
    this.img = img;
    this.body = Bodies.circle(x, y, r, {
      restitution: 0.6,
      collisionFilter: {
        category: category
      }
    });
    
    Body.setMass(this.body, 10);
    
    World.add(world, this.body);
  }
  
  show() {
    push();
    translate(this.body.position.x,
      this.body.position.y);
    rotate(this.body.angle);
    
    if (this.img) {
      imageMode(CENTER);
      image(this.img, 0, 0,
        2 * this.body.circleRadius,
        2 * this.body.circleRadius);
    } else {
      ellipse(0, 0,
        2 * this.body.circleRadius,
        2 * this.body.circleRadius);
    }
    pop();
  }
}

// Bird
class Bird extends Animal {
  constructor(x, y, r, img){
    super(x, y, r, 2, img);
  }
}

// Pig
class Pig extends Animal {
  constructor(x, y, r, img){
    super(x, y, r, 1, img);
  }
}

// Slingshot
class Slingshot {
  constructor(bird){
    this.sling = Constraint.create({
      pointA: {
        x: bird.body.position.x,
        y: bird.body.position.y
      },
      bodyB: bird.body,
      length: 5,
      stiffness: 0.05,
      damping : 0.05
    });
    World.add(world, this.sling);
  }
  
  fly(mc){      
    if (this.sling.bodyB &&
      mc.mouse.button === -1 &&
      this.sling.bodyB.position.x >
      this.sling.pointA.x + 10) {
      this.sling.bodyB.collisionFilter.category = 1;
      this.sling.bodyB = null;
    }
  }
  
  hasBird(){
    return this.sling.bodyB != null;
  }
  
  attach(bird){
    this.sling.bodyB = bird.body;
  }
  
  show(){
    if (this.sling.bodyB){
      line(this.sling.pointA.x,
        this.sling.pointA.y,
        this.sling.bodyB.position.x,
        this.sling.bodyB.position.y);
    }
  }
}
