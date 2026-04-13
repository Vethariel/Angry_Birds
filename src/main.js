let sketch = function(p) {
    p.setup = function() {
        p.createCanvas(800, 560);
    };
    
    p.draw = function() {
        p.background(128);
    };
};

new p5(sketch);