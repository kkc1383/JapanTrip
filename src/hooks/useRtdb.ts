import { useEffect, useState } from 'react'
import { onValue, ref } from 'firebase/database'
import { db } from '../lib/firebase'

export function useRtdbValue<T>(path: string): T | null {
  const [value, setValue] = useState<T | null>(null)
  useEffect(() => onValue(ref(db, path), snap => setValue(snap.val())), [path])
  return value
}

export function useConnected(): boolean {
  const [connected, setConnected] = useState(true)
  useEffect(
    () => onValue(ref(db, '.info/connected'), snap => setConnected(snap.val() === true)),
    [],
  )
  return connected
}
