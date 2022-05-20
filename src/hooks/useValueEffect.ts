import { useCallbackRef } from '@chakra-ui/react'
import Value from 'libs/Value'
import { useEffect } from 'react'
import useValue from './useValue'

export default function useValueEffect<T>(value: Value<T>, callback: (value: T) => ReturnType<React.EffectCallback>) {
  const [dep] = useValue(value)
  const effect = useCallbackRef(callback)
  useEffect(() => effect(dep), [dep])
}
