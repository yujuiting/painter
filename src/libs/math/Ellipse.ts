import Shape from "./Shape";
import Vector from "./Vector";

export default class Ellipse implements Shape {
  constructor(
    public center: Vector,
    public width: number,
    public height: number
  ) {}

  contains(point: Vector) {
    const xRadius = this.width / 2;
    const yRadius = this.height / 2;
    if (xRadius <= 0 || yRadius <= 0) return false;
    const normalized = point.clone().subtract(this.center);
    const xSquare = normalized.x * normalized.x;
    const ySquare = normalized.y * normalized.y;
    const xrSquare = xRadius * xRadius;
    const yrSquare = yRadius * yRadius;
    return xSquare / xrSquare + ySquare / yrSquare <= 1;
  }
}
