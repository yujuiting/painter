import Ellipse from 'libs/math/Ellipse'
import Line from 'libs/math/Line'
import Rect from 'libs/math/Rect'
import Shape from 'libs/math/Shape'
import Vector from 'libs/math/Vector'
import { Painter } from 'libs/painter/Painter'
import { useEffect, useRef } from 'react'
import rough from 'roughjs'
import { RoughCanvas } from 'roughjs/bin/canvas'

import { useCallbackRef } from '@chakra-ui/react'
import useValue from 'hooks/useValue'

export interface PainterCanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  painter: Painter
}

export default function PainterCanvas({ painter, ...props }: PainterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const roughRef = useRef<RoughCanvas>()
  const [drawings] = useValue(painter.drawings)
  const [selectedDrawing] = useValue(painter.selectedDrawing)
  const [selectionHandler] = useValue(painter.selectionHandler)

  const redraw = useCallbackRef(() => {
    if (!canvasRef.current) return
    if (!roughRef.current) return
    const canvas = canvasRef.current
    const roughCanvas = roughRef.current
    painter.applyToCanvas(canvas, roughCanvas)
  }, [])

  useEffect(redraw, [drawings, selectedDrawing, selectionHandler])

  useEffect(() => {
    if (!canvasRef.current) return

    roughRef.current = rough.canvas(canvasRef.current)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    let startPoint = new Vector()
    let currentPoint = new Vector()
    let delta = new Vector()
    let isMouseDown = false
    let isDrawing = false
    let tool = painter.tool.get()

    function onMouseDown(e: MouseEvent) {
      if (isMouseDown) return
      startPoint.setTo(e.offsetX, e.offsetY)
      currentPoint.setTo(e.offsetX, e.offsetY)
      delta = delta.copy(currentPoint).subtract(startPoint)
      isMouseDown = true
      tool = painter.tool.get()
    }

    function onMouseMove(e: MouseEvent) {
      currentPoint.setTo(e.offsetX, e.offsetY)
      delta = delta.copy(currentPoint).subtract(startPoint)
      canvas.style.cursor = painter.getCursor(currentPoint)
      if (!isMouseDown) return
      if (!isDrawing && tool !== 'select') isDrawing = true
      redraw()
      ctx.strokeStyle = '#000'
      ctx.beginPath()
      switch (tool) {
        case 'ellipse': {
          const halfDelta = delta.clone().multiply(0.5)
          const center = new Vector().copy(startPoint).add(halfDelta)
          ctx.ellipse(center.x, center.y, Math.abs(halfDelta.x), Math.abs(halfDelta.y), 0, 0, 2 * Math.PI)
          break
        }
        case 'line': {
          ctx.moveTo(startPoint.x, startPoint.y)
          ctx.lineTo(currentPoint.x, currentPoint.y)
          break
        }
        case 'rect': {
          ctx.rect(startPoint.x, startPoint.y, delta.x, delta.y)
          break
        }
      }
      ctx.stroke()
      ctx.closePath()
    }

    function onMouseUp(e: MouseEvent) {
      currentPoint.setTo(e.offsetX, e.offsetY)
      delta = delta.copy(currentPoint).subtract(startPoint)
      if (!isMouseDown) return
      isMouseDown = false
      let shape: Shape | undefined
      switch (tool) {
        case 'select': {
          painter.selectByPoint(currentPoint)
          break
        }
        case 'ellipse': {
          const halfDelta = delta.clone().multiply(0.5)
          const center = new Vector().copy(startPoint).add(halfDelta)
          shape = new Ellipse(center, delta.x, delta.y)
          break
        }
        case 'line': {
          shape = new Line(startPoint.clone(), currentPoint.clone())
          break
        }
        case 'rect': {
          shape = new Rect(startPoint.clone(), delta.x, delta.y)
          break
        }
      }
      if (shape) painter.draw(shape)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('mousemove', onMouseMove)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} {...props} />
}
