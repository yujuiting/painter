import Line from './Line'
import Ray from './Ray'
import Shape from './Shape'
import Vector from './Vector'

export default class Polygon implements Shape {
  sides: Line[] = []

  get min(): Vector {
    const minX = this.points.reduce((min, point) => (point.x < min ? point.x : min), Number.MAX_SAFE_INTEGER)
    const minY = this.points.reduce((min, point) => (point.y < min ? point.y : min), Number.MAX_SAFE_INTEGER)
    return new Vector(minX, minY)
  }

  get max(): Vector {
    const maxX = this.points.reduce((max, point) => (point.x > max ? point.x : max), Number.MIN_SAFE_INTEGER)
    const maxY = this.points.reduce((max, point) => (point.y > max ? point.y : max), Number.MIN_SAFE_INTEGER)
    return new Vector(maxX, maxY)
  }

  constructor(public points: Vector[] = []) {
    this.calculateSides()
  }

  calculateSides() {
    const count = this.points.length
    this.sides = []
    for (let i = 0; i < count; i++) {
      const p1 = this.points[i]
      const p2 = this.points[i + (1 % count)]
      this.sides.push(new Line(p1, p2))
    }
  }

  contains(point: Vector) {
    const ray = new Ray(point, Vector.Right)
    const count = this.sides.reduce((acc, side) => (ray.intersect(side) === -1 ? acc : acc++), 0)
    return count % 2 !== 0
  }
}
