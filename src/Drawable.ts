import { Vector } from "p5";


export interface Drawable {
    pos: Vector;
    draw(): void;
    move(): void;
}
