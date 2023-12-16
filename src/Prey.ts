import * as p5 from 'p5';
import { Vector } from "p5";
import { Circle, Point } from './Quadtree';

export interface Drawable {
    pos: Vector;
    draw(): void;
    move(): void;
}

export class Prey implements Drawable, Point, Circle {
    pos: Vector;
    public get x() {
        return this.pos.x
    }
    public get y() {
        return this.pos.y
    }
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
    spawntime: number;
    spawntimeMax: number;
    private _spawns: Prey[];
    public get spawned(): Prey[] {

        return this._spawns;
    }
    constructor(pos: Vector, p5Ref: p5, radius: number = 5, movementPoints: number = 500, movementPointsRegen: number = 3, movementMultiplier: number = 5, visionDistance: number = 300, numberOfVisionLines: number = 9, turnAngle: number = 15, timeToReplicate: number = 200) {
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
        this.spawntime = 0;
        this.spawntimeMax = timeToReplicate;
        this._spawns = [];
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
            this.spawntime += temp.mag();
            if (this.spawntime > this.spawntimeMax) {
                this.spawn();
            }
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

    spawn() {
        let determiner = this._p5.random(0, 100);
        if (determiner >= 101) {
            let nPrey = new Prey(this._p5.createVector(this._p5.random(this._p5.width), this._p5.random(this._p5.height)), this._p5);
            this._spawns.push(nPrey);
        }
        this.spawntime = 0;
    }
    popSpawns() {
        while (this._spawns.length > 0) {
            this._spawns.pop();
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

    add(vec: p5.Vector): Point {
        return new Point(this.pos);
    }

}

export class DebugObject {
    showVisionLines: boolean;
    constructor() {
        this.showVisionLines = false;
    }
}