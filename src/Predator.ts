import * as p5 from "p5";
import { Vector } from "p5";
import { Prey } from './Prey';
import { DebugObject } from './DebugObject';
import { Drawable } from './Drawable';
import { Quadtree, inteceptCircleLineSeg } from './Quadtree';
import { Point } from "./QuadtreeUtils/Point";
import { Line } from "./QuadtreeUtils/Line";

export class Predator implements Drawable {
    _p5: p5;
    pos: Vector;
    heading: Vector;
    radius: number;
    growSize: number;
    visionLines: Line[];
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
        this.visionLines.forEach((line) => {
            this._p5.line(this.pos.x, this.pos.y, this.pos.x + line.p2.x, this.pos.y + line.p2.y);
            this._p5.stroke(0, 255, 0);
        })
    }
    calculateVisionLineOffsets() {
        this.visionLinesAngle = 360 / this._numberOfVisionLines;
        let up = this._p5.createVector(0, -1);
        for (let i = 0; i < this._numberOfVisionLines; i++) {
            let c = up.copy();
            c.mult(this.visionDistance);
            let newLine = new Line();
            newLine.p1 = new Point(0, 0);
            newLine.p2 = new Point(c.x, c.y);
            this.visionLines.push(newLine);
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
            } else {
                this.castVisionRays(other);
            }
        }
        return eaten;
    }
    castVisionRays(other: Prey) {
        let found = false;
        let index = 0;
        let retArray: Point[] = [];
        while (!found) {
            let line = this.visionLines[index];
            let newLine = new Line();
            newLine.p1 = new Point(this.pos);
            newLine.p2 = new Point(line.p2.x + this.pos.x, line.p2.y + this.pos.y);
            retArray = inteceptCircleLineSeg(other, newLine);
            if (retArray.length > 0) {
                found = true;
                console.log(retArray);
            }
            index++;
            if (index == this.visionLines.length) found = true;
        }
        return retArray;
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