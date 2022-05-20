import Vector from './Vector'

export default interface Shape {
  min: Vector
  max: Vector
  contains(point: Vector): boolean
}
