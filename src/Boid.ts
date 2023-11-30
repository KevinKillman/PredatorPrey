
import { Vector, } from 'p5';
export class Boid {
    position: Vector;
    radius: number = 5;
    m: number;
    velocity: Vector;
    acceleration: Vector;
    maxForce: number;
    maxSpeed: number;
    alignRadius: number;
    cohesionRadius: number;
    separationRadius: number;
    _p5: p5;
    alignSlider: any;
    cohesionSlider: any;
    separationSlider: any;
    constructor(p5Ref: p5) {
        this._p5 = p5Ref;
        this.position = this._p5.createVector(this._p5.random(this._p5.width), this._p5.random(this._p5.height));
        this.velocity = Vector.random2D();
        this.velocity.setMag(this._p5.random(2, 4));
        this.acceleration = this._p5.createVector();
        this.maxForce = 0.2;
        this.maxSpeed = 5;
        this.alignRadius = 90;
        this.cohesionRadius = 60;
        this.separationRadius = 60;
        this.m = this.radius * .1;
    }

    edges() {
        if (this.position.x > this._p5.width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = this._p5.width;
        }
        if (this.position.y > this._p5.height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = this._p5.height;
        }
    }

    align(boids: Boid[]) {
        let perceptionRadius = this.alignRadius;
        let steering = this._p5.createVector();
        let total = 0;
        for (let other of boids) {
            let d = this._p5.dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(boids: Boid[]) {
        let perceptionRadius = this.separationRadius;
        let steering = this._p5.createVector();
        let total = 0;
        for (let other of boids) {
            let d = this._p5.dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                let diff = Vector.sub(this.position, other.position);
                diff.div(d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(boids: Boid[]) {
        let perceptionRadius = this.cohesionRadius;
        let steering = this._p5.createVector();
        let total = 0;
        for (let other of boids) {
            let d = this._p5.dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    flock(boids: Boid[]) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);
        if (this.alignSlider && this.cohesionSlider && this.separationSlider) {
            alignment.mult(this.alignSlider.value());
            cohesion.mult(this.cohesionSlider.value());
            separation.mult(this.separationSlider.value());
        }


        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);

    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
        this.edges();
    }

    collision(others: Boid[]) {
        for (let i = 0; i < others.length; i++) {
            const p = others[i];
            if (p != this) {
                let distanceVect = Vector.sub(p.position, this.position);
                let dMag = distanceVect.mag();
                let minDistance = this.radius + p.radius
                if (dMag <= minDistance) {
                    let distanceCorrection = (minDistance - dMag) / 2.0
                    this.collisionResolution(distanceVect, distanceCorrection, p);
                    let newDist = Vector.sub(p.position, this.position);
                    if (newDist.mag() <= minDistance) {
                        if (this.position.x >= p.position.x) {
                            this.position.x += this.radius / 2;
                        } else {
                            p.position.x += p.radius / 2;
                        }
                    }
                }
            }
        }
    }
    collisionResolution(distanceVect: Vector, distanceCorrection: number, other: Boid) {
        let dCorrection = distanceCorrection;
        let d = distanceVect.copy();
        let correctionVector = d.normalize().mult(dCorrection);
        other.position.add(correctionVector);
        this.position.sub(correctionVector);

        let theta = distanceVect.heading();
        let sine = this._p5.sin(theta);
        let cosine = this._p5.cos(theta);

        /* bTemp will hold rotated ball this.positions. You
just need to worry about bTemp[1] this.position*/
        let bTemp = [this._p5.createVector(), this._p5.createVector()];

        /* this ball's this.position is relative to the other
         so you can use the vector between them (bVect) as the
         reference point in the rotation expressions.
         bTemp[0].this.position.x and bTemp[0].this.position.y will initialize
         automatically to 0.0, which is what you want
         since b[1] will rotate around b[0] */
        bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
        bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;

        // rotate Temporary velocities
        let vTemp = [this._p5.createVector(), this._p5.createVector()];

        vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
        vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
        vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y;
        vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x;

        /* Now that velocities are rotated, you can use 1D
conservation of momentum equations to calculate
the final this.velocity along the x-axis. */
        let vFinal = [this._p5.createVector(), this._p5.createVector()];

        // final rotated this.velocity for b[0]
        vFinal[0].x =
            ((this.m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) /
            (this.m + other.m);
        vFinal[0].y = vTemp[0].y;

        // final rotated this.velocity for b[0]
        vFinal[1].x =
            ((other.m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) /
            (this.m + other.m);
        vFinal[1].y = vTemp[1].y;

        // hack to avoid clumping
        // bTemp[0].x += vFinal[0].x;
        // bTemp[1].x += vFinal[1].x;

        /* Rotate ball this.positions and velocities back
         Reverse signs in trig expressions to rotate
         in the opposite direction */
        // rotate balls
        let bFinal = [this._p5.createVector(), this._p5.createVector()];

        bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
        bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
        bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
        bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;

        // update balls to screen this.position
        other.position.x = this.position.x + bFinal[1].x;
        other.position.y = this.position.y + bFinal[1].y;

        this.position.add(bFinal[0]);

        // update velocities
        this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
        this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
        other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
        other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
    }

    show() {
        this._p5.strokeWeight(2);
        this._p5.stroke(255);
        this._p5.fill(0, 255, 0);
        this._p5.circle(this.position.x, this.position.y, this.radius * 2);
        // let vCopy = this.velocity.copy();
        // this._p5.stroke(255, 0, 0);
        // vCopy.mult(10);
        // this._p5.line(this.position.x, this.position.y, (this.position.x + vCopy.x), (this.position.y + vCopy.y));

    }
}