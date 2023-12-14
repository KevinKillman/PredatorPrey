import * as p5 from "p5";
import { Vector } from "p5";
import { DebugObject, Drawable, Prey } from './Prey';

export class Predator implements Drawable {
    _p5: p5;
    pos: Vector;
    heading: Vector;
    radius: number;
    growSize: number;
    visionLines: Vector[];
    headingIncrease: Vector;
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
    color: p5.Color;
    numberEaten: number;
    debugObj: DebugObject;


    constructor(pos: Vector, p5Ref: p5, visionDistance: number = 150, numberOfVisionLines: number = 8) {
        this.pos = pos;
        this.heading = p5Ref.createVector(p5Ref.random(-1, 1), p5Ref.random(-1, 1)).normalize();
        this.headingIncrease = this.heading.copy();
        this.headingIncrease.mult(.2);
        this._p5 = p5Ref;
        this.radius = 5;
        this.growSize = 1;
        this.visionLines = [];
        this._numberOfVisionLines = numberOfVisionLines;
        this.visionDistance = visionDistance;
        this.debugObj = new DebugObject();
        this.debugObj.showVisionLines = false;
        this.calculateVisionLineOffsets();
        this.color = this._p5.color(255, 0, 0);
        this.numberEaten = 0;
    }

    draw() {
        this._p5.push();
        this._p5.stroke(this.color);
        this._p5.fill(this.color);
        this._p5.circle(this.pos.x, this.pos.y, this.radius * 2);
        this._p5.stroke(this._p5.color("white"));
        this._p5.fill(this._p5.color("white"));
        this._p5.textAlign(this._p5.CENTER, this._p5.CENTER);
        this._p5.text(this.numberEaten.toString(), this.pos.x, this.pos.y);
        if (this.debugObj.showVisionLines) {
            this.drawVisionRays();
        }
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
        this.visionLines.forEach((point) => {
            this._p5.line(this.pos.x, this.pos.y, this.pos.x + point.x, this.pos.y + point.y);
            this._p5.stroke(0, 255, 0);
        })
    }
    calculateVisionLineOffsets() {
        this.visionLinesAngle = 360 / this._numberOfVisionLines;
        let up = this._p5.createVector(0, -1);
        for (let i = 0; i < this._numberOfVisionLines; i++) {
            let c = up.copy();
            c.mult(this.visionDistance);
            this.visionLines.push(c);
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
        this.numberEaten++;
        if (this.radius <= this._p5.width / 10) {
            this.radius += this.growSize;
        }
        if (this.radius > this.visionDistance) {
            this.visionDistance = this.radius;
        }
        // this.heading.add(this.headingIncrease);
    }
}