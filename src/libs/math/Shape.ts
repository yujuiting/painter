import Vector from "./Vector";

export default interface Shape {
  contains(point: Vector): boolean;
}
