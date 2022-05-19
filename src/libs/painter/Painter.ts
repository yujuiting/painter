import Ellipse from 'libs/math/Ellipse'
import Line from 'libs/math/Line'
import Rect from 'libs/math/Rect'
import Shape from 'libs/math/Shape'
import Vector from 'libs/math/Vector'
import Value from 'libs/Value'
import rough from 'roughjs'

import type { Drawable, Options as DrawOptions } from 'roughjs/bin/core'

export const tools = ['select', 'ellipse', 'line', 'rect'] as const

export type Tool = typeof tools[number]

export interface Drawing {
  hitbox: Shape
  drawable: Drawable
  fill: string
  stroke: string
}

export type Listener = (painter: Painter) => void

export class Painter {
  tool = new Value<Tool>('select')

  fillColor = new Value('#000000')

  strokeColor = new Value('#000000')

  drawings = new Value<Drawing[]>([])

  histories = new Value<Drawing[][]>([[]])

  currentHistory = new Value(0)

  generator = rough.generator({
    options: {
      strokeWidth: 5,
      simplification: 1000,
      disableMultiStroke: true,
      disableMultiStrokeFill: true,
    },
  })

  constructor() {}

  draw(shape: Shape) {
    const options: DrawOptions = { fill: this.fillColor.get(), stroke: this.strokeColor.get() }
    let drawable: Drawable | undefined
    if (shape instanceof Ellipse) {
      drawable = this.generator.ellipse(shape.center.x, shape.center.y, shape.width, shape.height, options)
    } else if (shape instanceof Line) {
      drawable = this.generator.line(shape.begin.x, shape.begin.y, shape.end.x, shape.end.y, options)
    } else if (shape instanceof Rect) {
      drawable = this.generator.rectangle(shape.position.x, shape.position.y, shape.width, shape.height, options)
    }
    if (drawable) this.add({ hitbox: shape, drawable, fill: this.fillColor.get(), stroke: this.strokeColor.get() })
  }

  add(drawing: Drawing) {
    this.drawings.set([...this.drawings.get(), drawing])
    this.updateHistories()
  }

  remove(drawing: Drawing) {
    const drawings = this.drawings.get()
    const index = drawings.indexOf(drawing)
    if (index === -1) return
    this.drawings.set([...drawings.slice(0, index), ...drawings.slice(index + 1)])
    this.updateHistories()
  }

  findByPoint(vector: Vector) {
    const drawings = this.drawings.get()
    for (let i = drawings.length - 1; i > 0; i--) {
      const drawing = drawings[i]
      if (drawing.hitbox.contains(vector)) {
        return drawing
      }
    }
  }

  redo() {
    const histories = this.histories.get()
    const currentHistory = this.currentHistory.get()
    const nextHistory = currentHistory + 1
    if (nextHistory >= histories.length) return
    this.currentHistory.set(nextHistory)
    this.drawings.set(histories[nextHistory])
  }

  undo() {
    const histories = this.histories.get()
    const currentHistory = this.currentHistory.get()
    const nextHistory = currentHistory - 1
    if (nextHistory < 0) return
    this.currentHistory.set(nextHistory)
    this.drawings.set(histories[nextHistory])
  }

  private updateHistories() {
    const currentHistory = this.currentHistory.get()
    this.histories.set([...this.histories.get().slice(0, currentHistory + 1), this.drawings.get()])
    this.currentHistory.set(this.histories.get().length - 1)
  }
}
