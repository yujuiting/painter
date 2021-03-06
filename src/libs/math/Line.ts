import Shape from './Shape'
import Vector from './Vector'

export default class Line implements Shape {
  constructor(public begin: Vector, public end: Vector) {}

  public get slope(): number {
    return (this.end.y - this.begin.y) / (this.end.x - this.begin.x)
  }

  public get intercept(): number {
    return this.begin.y - this.slope * this.begin.x
  }

  public get length(): number {
    return this.begin.distanceTo(this.end)
  }

  public get min(): Vector {
    return (this.begin.lessThanEqual(this.end) ? this.begin : this.end).clone()
  }

  public get max(): Vector {
    return (this.begin.greaterThan(this.end) ? this.begin : this.end).clone()
  }

  public getLength(): number {
    return this.begin.distanceTo(this.end)
  }

  public getDirection(): Vector {
    return this.end.clone().subtract(this.begin).normalize()
  }

  /**
   * Resolve given point with given axis by this line's slope and intercept.
   * Answer may not lay on this line.
   * @param point The point want to resolve.
   * @param axis Value of axis has been known.
   */
  public resolvePoint(point: Vector, axis: 'x' | 'y'): void {
    switch (axis) {
      case 'x':
        point.setTo(point.x, this.slope * point.x + this.intercept)
        break
      case 'y':
        point.setTo((point.y - this.intercept) / this.slope, point.y)
        break
      default:
        break
    }
  }

  /**
   * @see http://stackoverflow.com/a/11908158/109458
   */
  public contains(point: Vector, threshold: number = 10000): boolean {
    const dxc = point.x - this.begin.x
    const dyc = point.y - this.begin.y

    const dxl = this.end.x - this.begin.x
    const dyl = this.end.y - this.begin.y

    const cross = dxc * dyl - dyc * dxl

    if (Math.abs(cross) > threshold) {
      return false
    }

    if (Math.abs(dxl) >= Math.abs(dyl)) {
      return dxl > 0
        ? this.begin.x <= point.x && point.x <= this.end.x
        : this.end.x <= point.x && point.x <= this.begin.x
    } else {
      return dyl > 0
        ? this.begin.y <= point.y && point.y <= this.end.y
        : this.end.y <= point.y && point.y <= this.begin.y
    }
  }

  public toString(): string {
    return `Line (${this.begin} -> ${this.end})`
  }
}
