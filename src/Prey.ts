import * as p5 from 'p5';
import { Vector } from "p5";

export interface Drawable {
    pos: Vector;
    draw(): void;
    move(): void;
}

export class Prey implements Drawable {
    pos: Vector;
    heading: Vector;
    visionLines: Vector[];
    ///so I can use a setter. Whenever this is set outside the object, the angle for the vision line rotation is recalculated.///
    private _numberOfVisionLines: number;
    public set numberOfVisionLines(numberOfVisionLines: number) {
        this._numberOfVisionLines = numberOfVisionLines;
        this.calculateVisionLineOffsets();
    }
    public get numberOfVisionLines() {
        return this._numberOfVisionLines;
    }
    visionLinesAngle: number;
    _p5: p5;
    radius: number
    movementPoints: number;
    movementPointsMax: number;
    movementPointsRegen: number;
    moving: Boolean;
    movementMultiplier: number;
    visionDistance: number;
    turnAngle: number;
    debugObj: DebugObject;
    constructor(pos: Vector, p5Ref: p5, radius: number = 5, movementPoints: number = 500, movementPointsRegen: number = 3, movementMultiplier: number = 5, visionDistance: number = 300, numberOfVisionLines: number = 9, turnAngle: number = 15) {
        this.pos = pos;
        this.heading = p5Ref.createVector(p5Ref.random(-1, 1), p5Ref.random(-1, 1)).normalize();
        this._p5 = p5Ref;
        this.visionLines = [];
        this.radius = radius;
        this.movementPoints = movementPoints;
        this.movementPointsMax = movementPoints;
        this.movementPointsRegen = movementPointsRegen;
        this.moving = true;
        this.movementMultiplier = movementMultiplier;
        this.visionDistance = visionDistance;
        this._numberOfVisionLines = numberOfVisionLines;
        this.turnAngle = turnAngle;
        this.debugObj = new DebugObject();
        this.calculateVisionLineOffsets();
    }
    calculateVisionLineOffsets() {
        this.visionLinesAngle = 360 / this._numberOfVisionLines;
    }
    move() {
        if (this.movementPoints > 0 && this.moving) {
            // this.heading.rotate(3);
            let temp = this.heading.copy();
            this.pos.sub(temp.mult(this.movementMultiplier));
            this.movementPoints -= temp.mag();
        } else {
            this.moving = false;
            this.regenMovement();
        }
        this.edges();
    }

    regenMovement() {
        if (this.movementPoints < this.movementPointsMax) {
            this.movementPoints += this.movementPointsRegen;
        } else {
            this.moving = true;
        }
    }

    rotateRight() {
        this.heading.rotate(this.turnAngle);
    }
    rotateLeft() {
        this.heading.rotate(-this.turnAngle)
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
    draw() {
        this._p5.push();
        this._p5.stroke(0, 255, 0);
        this._p5.fill(0, 255, 0);
        this._p5.circle(this.pos.x, this.pos.y, this.radius * 2);
        if (this.debugObj.showVisionLines) {
            this.drawVisionRays();
        }
        this._p5.pop();
    }

    drawVisionRays() {
        let headingCopy = this.heading.copy();
        this._p5.stroke(255, 0, 0);
        for (let i = 0; i < this._numberOfVisionLines; i++) {
            let rotated = headingCopy.copy();
            rotated.mult(this.visionDistance);
            let rayEndpoint = Vector.sub(this.pos, rotated);
            this._p5.line(this.pos.x, this.pos.y, rayEndpoint.x, rayEndpoint.y);
            this._p5.stroke(0, 255, 0);
            headingCopy.rotate(this.visionLinesAngle);
        }
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

class DebugObject {
    showVisionLines: boolean;
    constructor() {
        this.showVisionLines = false;
    }
}