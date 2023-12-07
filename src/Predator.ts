import * as p5 from "p5";
import { Vector } from "p5";
import { Drawable, Prey } from "./Prey";

export class Predator implements Drawable {
    _p5: p5;
    pos: Vector;
    heading: Vector;
    radius: number;
    growSize: number;
    visionLines: Vector[];
    private _numberOfVisionLines: number;
    public set numberOfVisionLines(numberOfVisionLines: number) {
        this._numberOfVisionLines = numberOfVisionLines;
        this.calculateVisionLineOffsets();
    }
    public get numberOfVisionLines() {
        return this._numberOfVisionLines;
    }
    visionLinesAngle: number;
    turnAngle: number;
    visionDistance: number;


    constructor(pos: Vector, p5Ref: p5, visionDistance: number = 150, numberOfVisionLines: number = 8) {
        this.pos = pos;
        this.heading = p5Ref.createVector(p5Ref.random(-1, 1), p5Ref.random(-1, 1)).normalize();
        this._p5 = p5Ref;
        this.radius = 5;
        this.growSize = 1;
        this.visionLines = [];
        this._numberOfVisionLines = numberOfVisionLines;
        this.visionDistance = visionDistance;
        this.calculateVisionLineOffsets();
    }

    draw() {
        this._p5.push();
        this._p5.stroke(255, 0, 0);
        this._p5.fill(255, 0, 0);
        this._p5.circle(this.pos.x, this.pos.y, this.radius);
        this.drawVisionRays();
        this._p5.pop();
    }
    move() {
        this.pos.sub(this.heading);
        this.edges();
    }
    edges() {
        if (this.pos.x > this._p5.width) {
            this.pos.x = 0;
        } else if (this.pos.x < 0) {
            this.pos.x = this._p5.width;
        }
        if (this.pos.y > this._p5.height) {
            this.pos.y = 0;
        } else if (this.pos.y < 0) {
            this.pos.y = this._p5.height;
        }
    }
    drawVisionRays() {
        this._p5.stroke(255, 0, 0);
        this.visionLines.forEach((line) => {
            let c = line.copy();
            c.mult(this.visionDistance);
            this._p5.line(this.pos.x, this.pos.y, this.pos.x + c.x, this.pos.y + c.y);
            this._p5.stroke(0, 255, 0);
        })
    }
    calculateVisionLineOffsets() {
        this.visionLinesAngle = 360 / this._numberOfVisionLines;
        let up = this._p5.createVector(0, -1);
        for (let i = 0; i < this._numberOfVisionLines; i++) {
            this.visionLines.push(up.copy());
            up.rotate(this.visionLinesAngle);
        }
    }
    collisionDetection(preyList: Prey[]) {
        let eaten = [];
        for (let i = 0; i < preyList.length; i++) {
            const other = preyList[i];
            let distanceVect = Vector.sub(other.pos, this.pos);
            let dMag = distanceVect.mag();
            let minDistance = this.radius + other.radius
            if (dMag <= minDistance) {
                eaten.push(other);
                this.consume(other);
            }
        }
        return eaten;
    }
    consume(prey: Prey) {
        this.radius += this.growSize;
    }
}