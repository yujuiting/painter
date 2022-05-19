import { useCallbackRef } from '@chakra-ui/react'
import Value from 'libs/Value'
import { useEffect, useState } from 'react'

export default function useValue<T>(value: Value<T>) {
  const [state, setState] = useState(value.get())
  useEffect(() => value.subscribe(setState), [value])
  return [state, useCallbackRef((nextValue: T) => value.set(nextValue), [value])] as const
}
