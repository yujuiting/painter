import { useEffect, useRef, useState } from "react";
import rough from "roughjs";

import {
  Box,
  Button,
  Center,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from "@chakra-ui/react";

import type { Drawable, Options as DrawOptions } from "roughjs/bin/core";
import { SketchPicker } from "react-color";

const tools = [
  // "select",
  "circle",
  "rect",
  "line",
] as const;

type Tool = typeof tools[number];

type Point = [x: number, y: number];

const pointZero: Point = [0, 0];

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<Tool>(tools[0]);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [svgSize, setSvgSize] = useState(0);
  const dataRef = useRef({
    sp: pointZero,
    cp: pointZero,
    d: pointZero,
    isMouseDown: false,
    isDrawing: false,
    drawables: [] as Drawable[],
    tool: currentTool,
    fillColor,
    strokeColor,
  });

  useEffect(() => {
    dataRef.current.tool = currentTool;
    dataRef.current.fillColor = fillColor;
    dataRef.current.strokeColor = strokeColor;
  }, [currentTool, fillColor, strokeColor]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);

    function onMouseDown(e: MouseEvent) {
      dataRef.current.sp = [e.offsetX, e.offsetY];
      dataRef.current.isMouseDown = true;
    }

    function onMouseUp(e: MouseEvent) {
      dataRef.current.isMouseDown = false;
      if (!dataRef.current.isDrawing) return;
      dataRef.current.isDrawing = false;
      ctx?.clearRect(0, 0, 600, 600);
      for (const drawable of dataRef.current.drawables) {
        roughCanvas.draw(drawable);
      }
      let drawable: Drawable | undefined;
      const { sp, cp, d } = dataRef.current;
      const options: DrawOptions = {
        fill: dataRef.current.fillColor,
        stroke: dataRef.current.strokeColor,
        strokeWidth: 5,
        simplification: 1000,
        disableMultiStroke: true,
        disableMultiStrokeFill: true,
      };
      switch (dataRef.current.tool) {
        case "rect":
          drawable = roughCanvas.rectangle(sp[0], sp[1], d[0], d[1], options);
          break;
        case "circle": {
          const cx = sp[0] + d[0] / 2;
          const cy = sp[1] + d[1] / 2;
          drawable = roughCanvas.ellipse(cx, cy, d[0], d[1], options);
          break;
        }
        case "line":
          drawable = roughCanvas.line(sp[0], sp[1], cp[0], cp[1], options);
          break;
      }
      if (drawable) dataRef.current.drawables.push(drawable);

      let svgSize = 0;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      for (const drawable of dataRef.current.drawables) {
        svg.appendChild(rough.svg(svg).draw(drawable));
      }
      setSvgSize(Buffer.byteLength(svg.innerHTML));
    }

    function onMouseMove(e: MouseEvent) {
      dataRef.current.cp = [e.offsetX, e.offsetY];
      if (!dataRef.current.isMouseDown) return;
      if (!dataRef.current.isDrawing) dataRef.current.isDrawing = true;
      const { sp, cp } = dataRef.current;
      dataRef.current.d = [cp[0] - sp[0], cp[1] - sp[1]];
      const { d } = dataRef.current;
      ctx?.clearRect(0, 0, 600, 600);
      for (const drawable of dataRef.current.drawables) {
        roughCanvas.draw(drawable);
      }
      ctx?.beginPath();
      switch (dataRef.current.tool) {
        case "rect":
          ctx?.rect(sp[0], sp[1], d[0], d[1]);
          break;
        case "circle": {
          const cx = sp[0] + d[0] / 2;
          const cy = sp[1] + d[1] / 2;
          const dx = Math.abs(d[0]) / 2;
          const dy = Math.abs(d[1]) / 2;
          ctx?.ellipse(cx, cy, dx, dy, 0, 0, 2 * Math.PI);
          break;
        }
        case "line":
          ctx?.moveTo(sp[0], sp[1]);
          ctx?.lineTo(cp[0], cp[1]);
          break;
      }
      ctx?.stroke();
      ctx?.closePath();
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  function renderTool(tool: Tool) {
    return (
      <Button
        key={tool}
        variant="outline"
        textTransform="capitalize"
        onClick={() => setCurrentTool(tool)}
        isActive={currentTool === tool}
      >
        {tool}
      </Button>
    );
  }

  return (
    <Center h="100vh">
      <Stack>
        <Stack direction="row">
          {tools.map(renderTool)}
          <Popover closeOnBlur>
            <PopoverTrigger>
              <Button>
                <Stack direction="row" align="center">
                  <Text>Fill</Text>
                  <Box w={3} h={3} bg={fillColor} />
                </Stack>
              </Button>
            </PopoverTrigger>
            <PopoverContent w="fit-content">
              <SketchPicker
                color={fillColor}
                onChange={(c) => setFillColor(c.hex)}
              />
            </PopoverContent>
          </Popover>
          <Popover closeOnBlur>
            <PopoverTrigger>
              <Button>
                <Stack direction="row" align="center">
                  <Text>Stroke</Text>
                  <Box w={3} h={3} bg={strokeColor} />
                </Stack>
              </Button>
            </PopoverTrigger>
            <PopoverContent w="fit-content">
              <SketchPicker
                color={strokeColor}
                onChange={(c) => setStrokeColor(c.hex)}
              />
            </PopoverContent>
          </Popover>
        </Stack>

        <Box border="1px solid black" w="600px" h="600px">
          <canvas ref={canvasRef} width="600px" height="600px" />
        </Box>

        <Box border="1px solid" overflow="hidden">
          <Box
            h={2}
            w={`${svgSize / 245.76}%`}
            bg={svgSize > 24576 ? "red" : "#000"}
          />
        </Box>
      </Stack>
    </Center>
  );
}
