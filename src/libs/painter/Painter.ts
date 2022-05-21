import Ellipse from 'libs/math/Ellipse'
import Line from 'libs/math/Line'
import Rect from 'libs/math/Rect'
import Shape from 'libs/math/Shape'
import Vector from 'libs/math/Vector'
import Value from 'libs/Value'
import rough from 'roughjs'
import type { RoughCanvas } from 'roughjs/bin/canvas'

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

interface SelectionHandler {
  topLeft: Rect
  topRight: Rect
  bottomLeft: Rect
  bottomRight: Rect
  top: Rect
  left: Rect
  right: Rect
  bottom: Rect
}

export class Painter {
  tool = new Value<Tool>('select')

  fillColor = new Value('#000000')

  strokeColor = new Value('#000000')

  drawings = new Value<Drawing[]>([])

  histories = new Value<Drawing[][]>([[]])

  currentHistory = new Value(0)

  selectedDrawing = new Value<Drawing | null>(null)

  selectionHandler = new Value<SelectionHandler | null>(null)

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
    if (this.selectedDrawing.get() === drawing) this.selectedDrawing.set(null)
    const drawings = this.drawings.get()
    const index = drawings.indexOf(drawing)
    if (index === -1) return
    this.drawings.set([...drawings.slice(0, index), ...drawings.slice(index + 1)])
    this.updateHistories()
  }

  findByPoint(vector: Vector) {
    const drawings = this.drawings.get()
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i]
      if (drawing.hitbox.contains(vector)) {
        return drawing
      }
    }
  }

  selectByPoint(vector: Vector) {
    this.selectedDrawing.set(this.findByPoint(vector) || null)
    this.updateSelectionHandler()
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

  applyToCanvas(canvas: HTMLCanvasElement, roughCanvas: RoughCanvas) {
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const drawing of this.drawings.get()) roughCanvas.draw(drawing.drawable)

    const selected = this.selectedDrawing.get()
    const selectionHandler = this.selectionHandler.get()

    if (selected) {
      const { hitbox } = selected
      const { min, max } = hitbox
      ctx.beginPath()
      ctx.rect(min.x, min.y, max.x - min.x, max.y - min.y)
      ctx.strokeStyle = '#ff0000'
      ctx.stroke()
      ctx.closePath()
    }

    if (selectionHandler) {
      drawHandler(selectionHandler.topLeft)
      drawHandler(selectionHandler.topRight)
      drawHandler(selectionHandler.bottomLeft)
      drawHandler(selectionHandler.bottomRight)
    }

    function drawHandler(rect: Rect) {
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#000'
      ctx.beginPath()
      ctx.rect(rect.position.x, rect.position.y, rect.width, rect.height)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  }

  getCursor(point: Vector) {
    const selectionHandler = this.selectionHandler.get()
    if (!selectionHandler) return 'auto'
    if (selectionHandler.topLeft.contains(point)) return 'nw-resize'
    if (selectionHandler.topRight.contains(point)) return 'ne-resize'
    if (selectionHandler.bottomLeft.contains(point)) return 'sw-resize'
    if (selectionHandler.bottomRight.contains(point)) return 'se-resize'
    if (selectionHandler.top.contains(point)) return 'ns-resize'
    if (selectionHandler.bottom.contains(point)) return 'ns-resize'
    if (selectionHandler.left.contains(point)) return 'ew-resize'
    if (selectionHandler.right.contains(point)) return 'ew-resize'
    return 'auto'
  }

  private updateHistories() {
    const currentHistory = this.currentHistory.get()
    this.histories.set([...this.histories.get().slice(0, currentHistory + 1), this.drawings.get()])
    this.currentHistory.set(this.histories.get().length - 1)
  }

  private updateSelectionHandler() {
    const drawing = this.selectedDrawing.get()
    if (!drawing) {
      this.selectionHandler.set(null)
      return
    }
    const size = 10
    const halfSize = size * 0.5
    const { min, max } = drawing.hitbox
    const delta = max.clone().subtract(min)
    const topLeft = new Vector(min.x, min.y).subtract(halfSize)
    const topRight = new Vector(max.x, min.y).subtract(halfSize)
    const bottomLeft = new Vector(min.x, max.y).subtract(halfSize)
    const bottomRight = new Vector(max.x, max.y).subtract(halfSize)
    this.selectionHandler.set({
      topLeft: new Rect(topLeft, size, size),
      topRight: new Rect(topRight, size, size),
      bottomLeft: new Rect(bottomLeft, size, size),
      bottomRight: new Rect(bottomRight, size, size),
      top: new Rect(topLeft, delta.x + size, size),
      left: new Rect(topLeft, size, delta.y + size),
      right: new Rect(topRight, size, delta.y + size),
      bottom: new Rect(bottomLeft, delta.x + size, size),
    })
  }
}
