import * as p5 from "p5";
import { Circle } from "./QuadtreeUtils/Circle";
import { Line } from "./QuadtreeUtils/Line";
import { Point } from "./QuadtreeUtils/Point";
import { Rectangle } from "./QuadtreeUtils/Rectangle";
/**
 * adapted from https://stackoverflow.com/questions/37224912/circle-line-segment-collision answer
 * @param circle
 * @param line
 * @returns
 */
export function inteceptCircleLineSeg(circle: Circle, line: Line): Point[] {
    var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
    v1 = new Point(line.p2.x - line.p1.x, line.p2.y - line.p1.y);
    v2 = new Point(line.p1.x - circle.pos.x, line.p1.y - circle.pos.y)
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if (isNaN(d)) { // no intercept
        return [];
    }
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;
    ret = []; // return array
    if (u1 <= 1 && u1 >= 0) {  // add point if on the line segment
        retP1 = new Point(line.p1.x + v1.x * u1, line.p1.y + v1.y * u1)
        ret[0] = retP1;
    }
    if (u2 <= 1 && u2 >= 0) {  // second add point if on the line segment
        retP2 = new Point(line.p1.x + v1.x * u2, line.p1.y + v1.y * u2)
        ret[ret.length] = retP2;
    }
    return ret;
}


export class Quadtree<Type extends Point> {
    boundary: Rectangle;
    capacity: number;
    points: Type[];
    nw: Quadtree<Type>;
    ne: Quadtree<Type>;
    sw: Quadtree<Type>;
    se: Quadtree<Type>;
    divided: Boolean;
    _p5: p5;
    /**
     *
     * @param boundary Area quadtree will cover
     * @param capacity how many points each quadrant will hold before being subdivided
     * @param p5Ref reference to p5 to use for debugging/drawing
     */
    constructor(boundary: Rectangle, capacity: number, p5Ref: p5 = null) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
        if (p5Ref) {
            this._p5 = p5Ref;
        }
    }
    /**
     * splits current Quadtree, or subsection, into 4 new Quadtrees.
     */
    subdivide() {
        let ne = new Rectangle(
            this.boundary.x + this.boundary.w / 2,
            this.boundary.y - this.boundary.h / 2,
            this.boundary.w / 2,
            this.boundary.h / 2);
        this.ne = new Quadtree<Type>(ne, this.capacity, this._p5);
        let nw = new Rectangle(
            this.boundary.x - this.boundary.w / 2,
            this.boundary.y - this.boundary.h / 2,
            this.boundary.w / 2,
            this.boundary.h / 2);
        this.nw = new Quadtree<Type>(nw, this.capacity, this._p5);
        let se = new Rectangle(
            this.boundary.x + this.boundary.w / 2,
            this.boundary.y + this.boundary.h / 2,
            this.boundary.w / 2,
            this.boundary.h / 2);
        this.se = new Quadtree<Type>(se, this.capacity, this._p5);
        let sw = new Rectangle(
            this.boundary.x - this.boundary.w / 2,
            this.boundary.y + this.boundary.h / 2,
            this.boundary.w / 2,
            this.boundary.h / 2);
        this.sw = new Quadtree<Type>(sw, this.capacity, this._p5);
        this.divided = true;
    }
    /**
     *
     * @param point point to be inserted
     */
    insert(point: Type) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        } else {
            if (!this.divided) {
                this.subdivide();
            }
            if (this.ne.insert(point)) return true;
            if (this.nw.insert(point)) return true;
            if (this.se.insert(point)) return true;
            if (this.sw.insert(point)) return true;
        }
    }
    /**
     *
     * @param range:Rectangle - area to be searched
     * @param found: for recursion, is returned. can pass own array instead of capturing return.
     * @returns All points within range.
     */

    query(range: Rectangle, found: Type[] = []): Type[] {

        if (!this.boundary.intersects(range)) {
            return found;
        } else {
            for (let p of this.points) {
                if (range.contains(p)) {
                    found.push(p);
                }
            }
        }
        if (this.divided) {
            this.nw.query(range, found);
            this.ne.query(range, found);
            this.sw.query(range, found);
            this.se.query(range, found);
        }
        return found;
    }

    /**
     * defaults to console logging all points in tree
     * @param func function that runs on all points
     */
    runFunctionOnAllPoints(func: Function = (point: Type) => { console.log(point); }) {
        this.points.forEach(p => { func(p) });
        if (this.divided) {
            this.nw.runFunctionOnAllPoints(func);
            this.ne.runFunctionOnAllPoints(func);
            this.sw.runFunctionOnAllPoints(func);
            this.se.runFunctionOnAllPoints(func);
        } else {
            return;
        }
    }

    /**
     * draw quadtree and points within
     * for debugging.
     */
    show() {
        this._p5.strokeWeight(1);
        this._p5.stroke(255);
        this._p5.noFill();
        this._p5.rectMode(this._p5.CENTER);
        this._p5.rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2)
        if (this.divided) {
            this.ne.show();
            this.nw.show();
            this.se.show();
            this.sw.show();
        }
        for (let p of this.points) {
            this._p5.stroke(255);
            this._p5.strokeWeight(1);
            this._p5.point(p.x, p.y);
        }
    }
}

