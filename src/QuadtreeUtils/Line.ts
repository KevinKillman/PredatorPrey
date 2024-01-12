import * as p5 from "p5";
import { Point } from "./Point";
export class Color {
    r: number;
    g: number;
    b: number;
}
export class LineSegment {
    lines: Line[]
    constructor() {
        this.lines = [];
    }
}

export class Line {
    p1: Point;
    p2: Point;
    color: Color;
    public constructor();
    public constructor(p1: Point, p2: Point)
    public constructor(...args: any[]) {
        this.color = new Color();
        this.color.r = 0;
        this.color.g = 255;
        this.color.b = 0;
        if (args.length === 2) {
            this.p1 = args[0];
            this.p2 = args[1];
        }
    }
}
