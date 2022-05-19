import Line from "./Line";
import Ray from "./Ray";
import Shape from "./Shape";
import Vector from "./Vector";

export default class Polygon implements Shape {
  sides: Line[] = [];

  constructor(public points: Vector[] = []) {
    this.calculateSides();
  }

  calculateSides() {
    const count = this.points.length;
    this.sides = [];
    for (let i = 0; i < count; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + (1 % count)];
      this.sides.push(new Line(p1, p2));
    }
  }

  contains(point: Vector) {
    const ray = new Ray(point, Vector.Right);
    const count = this.sides.reduce(
      (acc, side) => (ray.intersect(side) === -1 ? acc : acc++),
      0
    );
    return count % 2 !== 0;
  }
}
