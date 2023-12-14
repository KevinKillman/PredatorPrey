import * as p5 from "p5";

export class Point {
    x: number;
    y: number;
    // userData: Type;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        // this.userData = userData;
    }
}


// x and y are the midpoint of the rectangle and the width and height
// are the distance to the top and bottom of the rectangle.
export class Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point: Point) {
        return (point.x > this.x - this.w && point.x < this.x + this.w && point.y > this.y - this.h && point.y < this.y + this.h)
    }

    intersects(range: Rectangle) {
        return !(range.x - range.w > this.x + this.w || range.x + range.w < this.x - this.w || range.y - range.h > this.y + this.h || range.y + range.h < this.y - this.h);
    }
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

