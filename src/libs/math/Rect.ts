import Shape from "./Shape";
import Vector from "./Vector";

export default class Rect implements Shape {
  public get center(): Vector {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  public get xMin(): number {
    return this.position.x;
  }

  public get xMax(): number {
    return this.position.x + this.width;
  }

  public get yMin(): number {
    return this.position.y;
  }

  public get yMax(): number {
    return this.position.y + this.height;
  }

  public get min(): Vector {
    return new Vector(this.xMin, this.yMin);
  }

  public get max(): Vector {
    return new Vector(this.xMax, this.yMax);
  }

  constructor(
    public position: Vector = new Vector(),
    public width: number = 0,
    public height: number = 0
  ) {}

  public contains(point: Vector): boolean {
    if (point.x < this.position.x) {
      return false;
    }

    if (point.y < this.position.y) {
      return false;
    }

    if (point.x > this.position.x + this.width) {
      return false;
    }

    if (point.y > this.position.y + this.height) {
      return false;
    }

    return true;
  }

  public overlap(another: Rect): boolean {
    if (this.xMax < another.xMin || this.xMin > another.xMax) {
      return false;
    }

    if (this.yMax < another.yMin || this.yMin > another.yMax) {
      return false;
    }

    return true;
  }
}
