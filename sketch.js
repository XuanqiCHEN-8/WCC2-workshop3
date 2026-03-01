/**
 * Base Logic: Derived from Sketch 84276 & scrape_highlands.js (Milly Gunn)
 * Visual Logic Source: "Ballons" by [Original Author], OpenProcessing Sketch 84276
 */

let volcanoes = [];
let volcanoData;
let ripples = [];

function preload() {
    // This function loads the real-world dataset generated via the Node.js Wikidata scraper
    volcanoData = loadJSON('volcanoes_data.json');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    let dataArray = Object.values(volcanoData);
    for (let i = 0; i < dataArray.length; i++) {
        let v = dataArray[i];
        // The geographic longitude and latitude are mapped to screen pixel coordinates
        let x = map(v.lon, -13.9, -13.3, 100, width - 100);
        let y = map(v.lat, 28.8, 29.5, height - 100, 100);
        // The Volcano class is initialized using the PVector structure from Sketch 84276
        volcanoes.push(new Volcano(x, y, v.name, v.elevation));
    }
}

function draw() {
    // A digital UI background is drawn with a coordinate grid and ambient lava glow
    drawProfessionalBackground();

    // The lifespan and display of interactive ripple effects are managed here
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].update();
        ripples[i].display();
        if (ripples[i].lifespan <= 0) ripples.splice(i, 1);
    }

    for (let i = 0; i < volcanoes.length; i++) {
        let d = dist(mouseX, mouseY, volcanoes[i].location.x, volcanoes[i].location.y);

        // The Perlin noise float logic from Sketch 84276 is triggered by mouse proximity
        if (d < 150) {
            let wind = createVector(map(noise(volcanoes[i].xoff), 0, 1, -1, 1), 
                                   map(noise(volcanoes[i].yoff), 0, 1, -0.8, 0.8));
            volcanoes[i].applyForce(wind);
            // Occasional ripples are generated when the user hovers over a volcano
            if (random(1) > 0.97) ripples.push(new Ripple(volcanoes[i].location.x, volcanoes[i].location.y));
        }

        // The sine wave center attraction logic from Sketch 84276 is used to maintain structure
        let center = createVector(volcanoes[i].location.x, height/2 + (60 * sin(volcanoes[i].location.x/90)));
        center.sub(volcanoes[i].location);
        center.normalize();
        center.mult(0.2); // Slightly reduced to allow the explosion to feel more impactful
        volcanoes[i].applyForce(center);

        // Mouse interaction and physics updates are executed from the original source
        volcanoes[i].mouseAction();
        volcanoes[i].update();
        volcanoes[i].display(d);

        // The nested loop pattern for proximity-based line connections is implemented here
        for (let j = 0; j < volcanoes.length; j++) {
            volcanoes[i].drawLine(volcanoes[j]);
        }
    }
}

// A high-intensity shockwave is triggered on all volcanoes when the mouse is clicked
function mousePressed() {
  let mousePos = createVector(mouseX, mouseY);
  // Multiple concentric ripples are created for a stronger visual impact
  for (let r = 0; r < 3; r++) {
    ripples.push(new Ripple(mouseX, mouseY, r * 20));
  }
  
  for (let v of volcanoes) {
    let explosion = p5.Vector.sub(v.location, mousePos);
    let distance = explosion.mag();
    // The force radius is expanded to ensure all nearby volcanoes are affected
    if (distance < 500) {
      // A non-linear force calculation is used to create a sharper blast near the center
      let strength = map(distance, 0, 500, 100, 0); 
      explosion.normalize();
      explosion.mult(strength);
      // The force is applied directly to the velocity to bypass the acceleration reset
      v.velocity.add(explosion.div(v.mass / 2));
    }
  }
}

function drawProfessionalBackground() {
    // A deep charcoal background is set with a technical GIS grid overlay
    background(15, 5, 5); 
    stroke(60, 20, 10); 
    strokeWeight(1);
    for (let i = 0; i < width; i += 50) line(i, 0, i, height);
    for (let j = 0; j < height; j += 50) line(0, j, width, j);

    // A radial gradient is rendered to simulate the subterranean glow of magma
    noStroke();
    for (let r = height; r > 0; r -= 100) {
        fill(40, 10, 0, map(r, height, 0, 5, 0));
        ellipse(width/2, height/2, r * 2, r * 2);
    }
}

class Volcano {
    constructor(x, y, name, ele) {
        // Physics vectors and Perlin noise offsets are inherited from Sketch 84276
        this.location = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        // Mass is dynamically assigned based on the elevation data from Wikidata
        this.mass = ele > 0 ? ele / 5 : 25;
        this.name = name;
        this.xoff = random(1000);
        this.yoff = random(10000);
    }

    // The standard force application method divides the incoming force by mass
    applyForce(force) {
        let f = force.copy();
        f.div(this.mass);
        this.acceleration.add(f);
    }

    // The Motion 101 update cycle is inherited from Sketch 84276
    update() {
        this.velocity.add(this.acceleration);
        // The speed limit is increased during explosions to allow for rapid movement
        this.velocity.limit(8.0); 
        this.location.add(this.velocity);
        // Velocity friction is applied to ensure the volcanoes eventually settle down
        this.velocity.mult(0.95); 
        this.acceleration.mult(0);
        this.xoff += 0.005;
        this.yoff += 0.005;
    }

    display(d) {
        push();
        translate(this.location.x, this.location.y);
        // A pulsing star effect is created to represent volcanic activity
        let pulse = sin(frameCount * 0.1) * 2;
        fill(255, 255, 220); 
        ellipse(0, 0, 10 + pulse/2, 10 + pulse/2);
        fill(255, 100, 0, 40);
        ellipse(0, 0, 35 + pulse, 35 + pulse);

        // Interactive labeling displays both the name and live screen coordinates
        if (d < 40) {
            fill(255, 200, 100);
            textAlign(LEFT);
            textSize(12);
            textFont('monospace'); 
            // The name is displayed in uppercase followed by its current X and Y position
            text(this.name.toUpperCase(), 12, 0);
            fill(255, 100, 0, 200);
            text("LOC: " + floor(this.location.x) + ", " + floor(this.location.y), 12, 14);
        }
        pop();
    }

    // The line drawing logic from Sketch 84276 is modified for a layered glow aesthetic
    drawLine(other) {
        let d = dist(this.location.x, this.location.y, other.location.x, other.location.y);
        if (d > 0 && d < 70) {
            stroke(255, 50, 0, map(d, 0, 70, 100, 0)); 
            strokeWeight(0.8);
            line(this.location.x, this.location.y, other.location.x, other.location.y);
            stroke(255, 200, 0, map(d, 0, 70, 50, 0));
            strokeWeight(1);
            line(this.location.x, this.location.y, other.location.x, other.location.y);
        }
    }

    // Mouse interaction logic calculates repulsion based on distance from the cursor
    mouseAction() {
        let mouse = createVector(mouseX, mouseY);
        let dir = p5.Vector.sub(mouse, this.location);
        let distance = dir.mag();
        if (distance < 100 && distance > 1) {
            let G = -1.5; 
            let strength = (G * this.mass) / (distance * distance);
            dir.normalize();
            dir.mult(strength);
            this.applyForce(dir);
        }
    }
}

class Ripple {
    // This class creates expanding seismic-wave visuals upon interaction
    constructor(x, y, offset = 0) {
        this.x = x;
        this.y = y;
        this.r = offset;
        this.lifespan = 255;
    }
    update() {
        this.r += 4;
        this.lifespan -= 4;
    }
    display() {
        noFill();
        stroke(255, 80, 0, this.lifespan);
        strokeWeight(1.5);
        ellipse(this.x, this.y, this.r, this.r);
    }
}