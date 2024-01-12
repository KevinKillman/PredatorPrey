import * as p5 from "p5";

export class Point {
    x: number;
    y: number;
    // userData: Type;
    public constructor();
    public constructor(vec: p5.Vector);
    public constructor(x: number, y: number);
    public constructor(...args: any[]) {
        if (args.length === 0) {
            this.x = 0;
            this.y = 0;
        }
        if (args.length === 1) {
            this.x = args[0].x;
            this.y = args[0].y;
        }
        if (args.length === 2) {
            this.x = args[0];
            this.y = args[1];
        }

        // this.userData = userData;
    }
}
