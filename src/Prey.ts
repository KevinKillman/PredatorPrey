import * as p5 from 'p5';
import { Vector } from "p5";

export class Prey {
    pos: Vector;
    heading: Vector;
    visionLines: Vector[];
    movementLines: Vector[];
    _p5: p5;
    radius: number
    constructor(pos: Vector, p5Ref: p5, radius: number = 30) {
        this.pos = pos;
        this.heading = p5Ref.createVector(0, 1);
        this._p5 = p5Ref;
        this.visionLines = [];
        this.movementLines = [];
        this.radius = radius;
    }
    move() {

    }

    draw() {
        this._p5.push();
        this._p5.stroke(0, 255, 0);
        this._p5.fill(0, 255, 0);
        this._p5.circle(this.pos.x, this.pos.y, this.radius * 2);
        this._p5.pop();
    }

    collision(proxList: Prey[]) {
        for (let i = 0; i < proxList.length; i++) {
            const other = proxList[i];
            if (other != this) {
                let distanceVect = Vector.sub(other.pos, this.pos);
                let dMag = distanceVect.mag();
                let minDistance = this.radius + other.radius
                if (dMag <= minDistance) {
                    let distanceCorrection = (minDistance - dMag) / 2.0
                    // this.collisionResolution(distanceVect, distanceCorrection, other);
                    let newDist = Vector.sub(other.pos, this.pos);
                    if (newDist.mag() <= minDistance) {
                        if (this.pos.x >= other.pos.x) {
                            this.pos.x += this.radius / 2;
                        } else {
                            other.pos.x += other.radius / 2;
                        }
                    }
                }
            }
        }
    }
}