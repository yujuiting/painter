export type ValueListener<T> = (value: T) => void;

export default class Value<T> {
  private listeners: ValueListener<T>[] = [];

  constructor(private value: T) {}

  subscribe(listener: ValueListener<T>) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      this.listeners.splice(index, 1);
    };
  }

  get() {
    return this.value;
  }

  set(value: T) {
    this.value = value;
    this.listeners.forEach((listener) => listener(value));
  }
}
