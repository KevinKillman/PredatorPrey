import * as p5 from "p5";
import { Vector } from "p5";
import { Prey } from './Prey';
import { DebugObject } from './DebugObject';
import { Drawable } from './Drawable';
import { Quadtree, inteceptCircleLineSeg } from './Quadtree';
import { Point } from './QuadtreeUtils/Point';
import { Line } from "./QuadtreeUtils/Line";

export interface VisionLinesObject {
    set numberOfVisionLines(x: number)
    get numberOfVisionLines()
    castVisionRays(other: Prey): void;

}

export class Predator implements Drawable, VisionLinesObject {
    _p5: p5;
    pos: Vector;
    heading: Vector;
    radius: number;
    growSize: number;
    /**
    * Each upper level element represents an entire vision line. get the last point of the last element(Line) to get endpoint of line.
     */
    visionLines: [Line[]];
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
    inputs: Vector[];
    noneInputVector: Vector;


    constructor(pos: Vector, p5Ref: p5, visionDistance: number = 150, numberOfVisionLines: number = 8) {
        this.pos = pos;
        this.heading = p5Ref.createVector(p5Ref.random(-1, 1), p5Ref.random(-1, 1)).normalize();
        this.headingIncrease = this.heading.copy();
        this.headingIncrease.mult(.2);
        this._p5 = p5Ref;
        this.radius = 5;
        this.growSize = 1;
        this._numberOfVisionLines = numberOfVisionLines;
        this.visionDistance = visionDistance;
        this.debugObj = new DebugObject();
        this.debugObj.showVisionLines = false;
        this.color = this._p5.color(255, 0, 0);
        this.numberEaten = 0;
        this.noneInputVector = p5Ref.createVector(0, 0)
        this.calculateVisionLineOffsets();

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
        let check = this.inputs.filter((x) => x != this.noneInputVector)
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
        this.visionLines.forEach((lineArray) => {
            lineArray.forEach((line) => {
                this._p5.stroke(line.color.r, line.color.g, line.color.b);
                this._p5.line(this.pos.x + line.p1.x, this.pos.y + line.p1.y, this.pos.x + line.p2.x, this.pos.y + line.p2.y);
            })
        })
    }
    calculateVisionLineOffsets() {
        this.visionLinesAngle = 360 / this._numberOfVisionLines;
        let up = this.heading.copy();
        for (let i = 0; i < this._numberOfVisionLines; i++) {
            let c = up.copy();
            c.mult(this.visionDistance);
            let newLine = new Line();
            newLine.p1 = new Point(0, 0);
            newLine.p2 = new Point(c.x, c.y);
            if (!this.visionLines) {
                this.visionLines = [[newLine]];
            } else {
                this.visionLines.push([newLine]);
            }
            up.rotate(this.visionLinesAngle);
        }
        //when resetting visionLines reset inputs as it should mirror length.
        this.inputs = [];
        this.visionLines.forEach((x) => this.inputs.push(this.noneInputVector));
    }
    collisionDetection(preyList: Prey[]) {
        let eaten = [];
        this.resetInputs();
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
    resetInputs() {
        this.inputs.fill(this.noneInputVector);
    }
    castVisionRays(other: Prey) {
        let found = false;
        let index = 0;
        let retArray: Point[] = [];
        while (!found) {
            //get the last part of the "line"
            let lastPartLine = this.visionLines[index][this.visionLines[index].length - 1];
            let newLine = new Line(new Point(this.pos), new Point(lastPartLine.p2.x + this.pos.x, lastPartLine.p2.y + this.pos.y));
            retArray = inteceptCircleLineSeg(other, newLine);
            if (retArray.length > 0) {
                found = true;
                /**
                 * still need to create multipart line.
                 * each element of this.visionLines represents 1 line segment made up of multiple lines
                 *
                 */
                if (retArray.length === 2) {
                    let originToOther = new Line(new Point(), new Point(retArray[0].x - this.pos.x, retArray[0].y - this.pos.y));
                    let otherToOther = new Line(new Point(retArray[0].x - this.pos.x, retArray[0].y - this.pos.y), new Point(retArray[1].x - this.pos.x, retArray[1].y - this.pos.y));
                    let otherToRayEnd = new Line(new Point(retArray[1].x - this.pos.x, retArray[1].y - this.pos.y), lastPartLine.p2);
                    otherToOther.color.r = 255;
                    otherToOther.color.g = 0;
                    this.visionLines[index] = [originToOther, otherToOther, otherToRayEnd];
                    this.inputs[index] = this._p5.createVector(retArray[0].x, retArray[0].y)
                } else if (retArray.length === 1) {
                    let originToOther = new Line(new Point(), new Point(retArray[0].x - this.pos.x, retArray[0].y - this.pos.y));
                    let otherToRayEnd = new Line(new Point(retArray[0].x - this.pos.x, retArray[0].y - this.pos.y), lastPartLine.p2);
                    otherToRayEnd.color.r = 255;
                    otherToRayEnd.color.g = 0;
                    this.visionLines[index] = [originToOther, otherToRayEnd];
                    this.inputs[index] = this._p5.createVector(retArray[0].x, retArray[0].y)
                } else {
                    this.visionLines[index] = [new Line(new Point(), lastPartLine.p2)]
                    this.inputs[index] = this.noneInputVector;
                }
            } else if (this.visionLines[index].length > 1) {
                this.visionLines[index] = [new Line(new Point(), lastPartLine.p2)]
                this.inputs[index] = this.noneInputVector;
            }
            index++;
            //break loop if we've gone to far
            if (index >= this.visionLines.length) found = true;
        }
        return retArray;
    }
    resetVisionLines() {
        this.visionLines.forEach((line, index) => {
            this.visionLines[index] = [new Line(new Point(), line[line.length - 1].p2)]
        })
    }
    consume(prey: Prey) {
        this.numberEaten++;
        if (this.radius <= this._p5.width / 10) {
            this.radius += this.growSize;
        }
        if (this.radius > this.visionDistance) {
            this.visionDistance = this.radius;
        }
        this.resetVisionLines();
        // this.heading.add(this.headingIncrease);
    }
}