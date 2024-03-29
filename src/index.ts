import * as p5 from 'p5';
import { Vector, } from 'p5';
import { Boid } from "./Boid";
import { Quadtree } from './Quadtree';
import { Rectangle } from "./QuadtreeUtils/Rectangle";
import { Point } from "./QuadtreeUtils/Point";
import { Prey } from './Prey';
import { Drawable } from './Drawable';
import { Predator } from './Predator';


let alignSlider: p5.Element, cohesionSlider: p5.Element, separationSlider: p5.Element, linesSlider: any;
let flock: Boid[] = [];
let preyQt: Quadtree<Prey>;
let range: Rectangle;
let canvasDimensions = { height: 1600, width: 800 };
let preys: Prey[] = [];
let preds: Predator[] = [];
let drawables: any[] = [];
const MAXPREY: number = 500;
export const sketch = (p5Ref: p5) => {
    p5Ref.setup = () => {
        let canvas = p5Ref.createCanvas(canvasDimensions.height, canvasDimensions.width);
        canvas.parent("canvasContainer")
        p5Ref.angleMode(p5Ref.DEGREES);
        linesSlider = p5Ref.createSlider(2, 14, 4, 1);



        for (let i = 0; i < 10; i++) {
            let prey = new Prey(p5Ref.createVector(p5Ref.random(p5Ref.width), p5Ref.random(p5Ref.height)), p5Ref);
            prey.movementMultiplier = p5Ref.random(1, 7);
            prey.debugObj.showVisionLines = false;
            preys.push(prey);
            drawables.push(prey);
        }
        for (let i = 0; i <= 3; i++) {
            let pred = new Predator(p5Ref.createVector(p5Ref.random(p5Ref.width), p5Ref.random(p5Ref.height)), p5Ref);
            pred.debugObj.showVisionLines = true;
            preds.push(pred);
            drawables.push(pred);
        }
        canvas.mouseClicked(() => {
            for (let pred of preds) {
                console.log(pred.inputs);
            }

            for (let prey of preys) {
                if (p5Ref.keyIsDown(p5Ref.CONTROL)) {
                    prey.rotateLeft();
                } else {
                    prey.rotateRight();
                }
            }
        })
    }

    p5Ref.draw = () => {
        p5Ref.background(0);
        //always recreate the boundary and Quadtree.
        let boundary = new Rectangle(canvasDimensions.height / 2, canvasDimensions.width / 2, canvasDimensions.width, canvasDimensions.height);
        preyQt = new Quadtree<Prey>(boundary, 4, p5Ref);
        for (let prey of preys) {
            let sliderVal = parseFloat(linesSlider.value());
            if (prey.numberOfVisionLines != sliderVal) {
                prey.numberOfVisionLines = sliderVal;
            }
            preyQt.insert(prey);

            //check if prey has replicated.
            if (prey.spawned.length > 0) {
                prey.spawned.forEach((spawn) => {
                    if (preys.length < MAXPREY) {
                        //insert into relevant data structures.
                        preyQt.insert(spawn);
                        preys.push(spawn);
                        drawables.push(spawn);
                    }
                })
                //call function to remove internal spawn references.
                prey.popSpawns();
            }
        }
        let eatenPreyMaster = [];
        for (let pred of preds) {
            let range = new Rectangle(pred.pos.x, pred.pos.y, pred.visionDistance, pred.visionDistance);
            let closePrey = preyQt.query(range);
            let eatenPrey = [];
            if (closePrey.length != 0) {
                eatenPrey = pred.collisionDetection(closePrey);
                if (eatenPrey.length != 0) {
                    for (let prey of eatenPrey) {
                        eatenPreyMaster.push(prey)

                    }
                }
            } else {
                pred.resetInputs();
            }
            pred.color = p5Ref.color("red");
        }
        for (let prey of eatenPreyMaster) {
            drawables = drawables.filter((x) => x != prey)
            preys = preys.filter((x) => x != prey);
        }
        preds.reduce((previous, current) => {
            if (current.numberEaten > previous.numberEaten) {
                return current;
            } else { return previous; }
        }).color = p5Ref.color("blue");

        for (let d of drawables) {
            d.move();
            d.draw();
        }
        // preyQt.show()

    }
}


export const myp5 = new p5(sketch);

// class Prey {
//     pos: Vector;
//     vel: Vector;
//     accel: Vector;
//     _p5: p5;
//     dimensions: any;
//     radius: number;
//     m: number;
//     constructor(startingPos: Vector, radius: number, p5Ref: p5, canvasDimensions: any, startVel: Vector = Vector.random2D(), startAccel: Vector = p5Ref.createVector()) {
//         this.pos = startingPos;
//         this._p5 = p5Ref;
//         this.vel = startVel.mult(3);
//         this.accel = startAccel;
//         this.dimensions = canvasDimensions;
//         this.radius = radius;
//         this.m = radius * .1;
//     }
//     draw() {
//         this.move();
//         this._p5.push();
//         this._p5.stroke(0, 0, 0);
//         this._p5.fill(0, 255, 0);
//         this._p5.ellipse(this.pos.x, this.pos.y, this.radius * 2)
//         this._p5.pop();
//     }
//     move() {
//         this.vel.add(this.accel);
//         this.pos.add(this.vel);
//         if (this.pos.x > this.dimensions.width) {
//             this.pos.x = 0
//         }
//         if (this.pos.x < 0) {
//             this.pos.x = this.dimensions.width
//         }
//         if (this.pos.y > this.dimensions.height) {
//             this.pos.y = 0
//         }
//         if (this.pos.y < 0) {
//             this.pos.y = this.dimensions.height
//         }
//     }
//     collision(preyList: Prey[]) {
//         for (let i = 0; i < preyList.length; i++) {
//             const p = preyList[i];
//             if (p != this) {
//                 let distanceVect = Vector.sub(p.pos, this.pos);
//                 let dMag = distanceVect.mag();
//                 let minDistance = this.radius + p.radius
//                 if (dMag <= minDistance) {
//                     let distanceCorrection = (minDistance - dMag) / 2.0
//                     this.collisionResolution(distanceVect, distanceCorrection, p);
//                     let newDist = Vector.sub(p.pos, this.pos);
//                     if (newDist.mag() <= minDistance) {
//                         if (this.pos.x >= p.pos.x) {
//                             this.pos.x += this.radius / 2;
//                         } else {
//                             p.pos.x += p.radius / 2;
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     collisionResolution(distanceVect: Vector, distanceCorrection: number, other: Prey) {
//         let dCorrection = distanceCorrection;
//         let d = distanceVect.copy();
//         let correctionVector = d.normalize().mult(dCorrection);
//         other.pos.add(correctionVector);
//         this.pos.sub(correctionVector);

//         let theta = distanceVect.heading();
//         let sine = this._p5.sin(theta);
//         let cosine = this._p5.cos(theta);

//         /* bTemp will hold rotated ball this.positions. You
// just need to worry about bTemp[1] this.position*/
//         let bTemp = [new p5.Vector(), new p5.Vector()];

//         /* this ball's this.position is relative to the other
//          so you can use the vector between them (bVect) as the
//          reference point in the rotation expressions.
//          bTemp[0].this.position.x and bTemp[0].this.position.y will initialize
//          automatically to 0.0, which is what you want
//          since b[1] will rotate around b[0] */
//         bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
//         bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;

//         // rotate Temporary velocities
//         let vTemp = [new p5.Vector(), new p5.Vector()];

//         vTemp[0].x = cosine * this.vel.x + sine * this.vel.y;
//         vTemp[0].y = cosine * this.vel.y - sine * this.vel.x;
//         vTemp[1].x = cosine * other.vel.x + sine * other.vel.y;
//         vTemp[1].y = cosine * other.vel.y - sine * other.vel.x;

//         /* Now that velocities are rotated, you can use 1D
// conservation of momentum equations to calculate
// the final this.velocity along the x-axis. */
//         let vFinal = [new p5.Vector(), new p5.Vector()];

//         // final rotated this.velocity for b[0]
//         vFinal[0].x =
//             ((this.m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) /
//             (this.m + other.m);
//         vFinal[0].y = vTemp[0].y;

//         // final rotated this.velocity for b[0]
//         vFinal[1].x =
//             ((other.m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) /
//             (this.m + other.m);
//         vFinal[1].y = vTemp[1].y;

//         // hack to avoid clumping
//         // bTemp[0].x += vFinal[0].x;
//         // bTemp[1].x += vFinal[1].x;

//         /* Rotate ball this.positions and velocities back
//          Reverse signs in trig expressions to rotate
//          in the opposite direction */
//         // rotate balls
//         let bFinal = [new p5.Vector(), new p5.Vector()];

//         bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
//         bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
//         bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
//         bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;

//         // update balls to screen this.position
//         other.pos.x = this.pos.x + bFinal[1].x;
//         other.pos.y = this.pos.y + bFinal[1].y;

//         this.pos.add(bFinal[0]);

//         // update velocities
//         this.vel.x = cosine * vFinal[0].x - sine * vFinal[0].y;
//         this.vel.y = cosine * vFinal[0].y + sine * vFinal[0].x;
//         other.vel.x = cosine * vFinal[1].x - sine * vFinal[1].y;
//         other.vel.y = cosine * vFinal[1].y + sine * vFinal[1].x;
//     }
// }

