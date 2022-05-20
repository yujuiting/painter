import { useEffect, useMemo, useRef, useState } from 'react'
import rough from 'roughjs'
import { FaUndo, FaRedo, FaTrash } from 'react-icons/fa'

import {
  chakra,
  Box,
  Button,
  Center,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  Textarea,
  RadioGroup,
  Radio,
  IconButton,
  Divider,
} from '@chakra-ui/react'

import type { Drawable, Options as DrawOptions } from 'roughjs/bin/core'
import { SketchPicker } from 'react-color'
import { AnimationA, AnimationB } from '../components/svgs'
import { Painter, Tool, tools } from 'libs/painter/Painter'
import useValue from 'hooks/useValue'
import PainterCanvas from 'components/PainterCanvas'
import Ellipse from 'libs/math/Ellipse'
import Line from 'libs/math/Line'
import Rect from 'libs/math/Rect'

export default function Index() {
  const [painter] = useState(() => new Painter())
  const [currentTool, setTool] = useValue(painter.tool)
  const [fillColor, setFillColor] = useValue(painter.fillColor)
  const [strokeColor, setStrokeColor] = useValue(painter.strokeColor)
  const [drawings] = useValue(painter.drawings)
  const [selectedDrawing] = useValue(painter.selectedDrawing)
  const svg = useMemo(() => {
    if (!process.browser) return ''
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const roughSvg = rough.svg(svg)
    for (const drawing of drawings) svg.appendChild(roughSvg.draw(drawing.drawable))

    return svg.innerHTML
  }, [drawings])
  const [gear, setGear] = useState('A')

  function renderTool(tool: Tool) {
    return (
      <Button
        key={tool}
        variant="outline"
        textTransform="capitalize"
        onClick={() => setTool(tool)}
        isActive={currentTool === tool}
      >
        {tool}
      </Button>
    )
  }

  return (
    <Center minH="100vh">
      <Stack>
        <Stack direction="row" align="center">
          <IconButton aria-label="undo" icon={<FaUndo />} onClick={() => painter.undo()} />
          <IconButton aria-label="redo" icon={<FaRedo />} onClick={() => painter.redo()} />
          <IconButton
            aria-label="delete"
            icon={<FaTrash />}
            disabled={!selectedDrawing}
            onClick={() => selectedDrawing && painter.remove(selectedDrawing)}
          />
          <Divider orientation="vertical" h={8} />
          <Text>Animation:</Text>
          <RadioGroup value={gear} onChange={setGear}>
            <Stack direction="row">
              <Radio value="A">A</Radio>
              <Radio value="B">B</Radio>
            </Stack>
          </RadioGroup>
        </Stack>
        <Stack direction="row" align="center">
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
              <SketchPicker color={fillColor} onChange={c => setFillColor(c.hex)} />
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
              <SketchPicker color={strokeColor} onChange={c => setStrokeColor(c.hex)} />
            </PopoverContent>
          </Popover>
        </Stack>

        <Box pos="relative" border="1px solid black" w="600px" h="600px">
          <chakra.svg width="600px" height="600px" pos="absolute" pointerEvents="none">
            <filter xmlns="http://www.w3.org/2000/svg" id="displacementFilter">
              <feTurbulence
                id="turbulenceMap"
                type="turbulence"
                baseFrequency="0.05"
                numOctaves="2"
                result="turbulence"
              >
                <animate attributeName="baseFrequency" values="0.01;0.001;0.01" dur="4s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap
                in2="turbulence"
                in="SourceGraphic"
                scale="9"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            {gear === 'A' && <AnimationA />}
            {gear === 'B' && <AnimationB />}
          </chakra.svg>
          <PainterCanvas painter={painter} width={600} height={600} />
        </Box>

        <Box border="1px solid" overflow="hidden">
          <Box h={2} w={`${Buffer.byteLength(svg) / 245.76}%`} bg={Buffer.byteLength(svg) > 24576 ? 'red' : '#000'} />
        </Box>
        {/* <Box>
          <svg width="600px" height="600px">
            <filter xmlns="http://www.w3.org/2000/svg" id="displacementFilter">
              <feTurbulence
                id="turbulenceMap"
                type="turbulence"
                baseFrequency="0.05"
                numOctaves="2"
                result="turbulence"
              >
                <animate
                  attributeName="baseFrequency"
                  values="0.01;0.001;0.01"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in2="turbulence"
                in="SourceGraphic"
                scale="9"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <Animation />
            <g dangerouslySetInnerHTML={{ __html: svg }} />
          </svg>
        </Box> */}
        {/* <Textarea
          maxW="600px"
          h="600px"
          whiteSpace="pre-wrap"
          value={svg}
          readOnly
        /> */}
      </Stack>
    </Center>
  )
}
