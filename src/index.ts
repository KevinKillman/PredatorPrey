import * as p5 from 'p5';
import { Vector, } from 'p5';
import { Boid } from "./Boid";
import { Rectangle, Point, Quadtree } from './Quadtree';


let alignSlider: p5.Element, cohesionSlider: p5.Element, separationSlider: p5.Element;
let flock: Boid[] = [];
let qt: Quadtree<Point<Boid>>;
let range: Rectangle;
let canvasDimensions = { height: 2000, width: 960 };
// let points: any[] = [];
export const sketch = (p: p5) => {
    p.setup = () => {
        let canvas = p.createCanvas(canvasDimensions.height, canvasDimensions.width);
        canvas.parent("canvasContainer")
        alignSlider = p.createSlider(0, 5, 1, .1);
        cohesionSlider = p.createSlider(0, 5, 1, .1);
        separationSlider = p.createSlider(0, 5, 1, .1);


        for (let i = 0; i <= 100; i++) {
            let b = new Boid(p);
            flock.push(b);
            b.alignSlider = alignSlider;
            b.cohesionSlider = cohesionSlider;
            b.separationSlider = separationSlider;
        }
    }

    p.draw = () => {
        p.background(0);
        let boundary = new Rectangle(canvasDimensions.height / 2, canvasDimensions.width / 2, canvasDimensions.height, canvasDimensions.width);
        qt = new Quadtree<Point<Boid>>(boundary, 4, p);
        for (let b of flock) {
            let point = new Point<Boid>(b.position.x, b.position.y, b);
            qt.insert(point);
        }

        for (let b of flock) {
            b.update();
            let range = new Rectangle(b.position.x, b.position.y, b.alignRadius, b.alignRadius)
            let other: Boid[] = qt.query(range).map((x) => x.userData);
            // b.flock(other);
            b.collision(other);
            b.show();
        }

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

