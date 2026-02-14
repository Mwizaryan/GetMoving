import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseTimerReturn {
  seconds: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: () => void
  formattedTime: string
}

export const useTimer = (initialSeconds: number = 0): UseTimerReturn => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const start = useCallback(() => {
    if (seconds < 0) setSeconds(0) // Validation
    setIsRunning(true)
  }, [seconds])

  const pause = useCallback(() => setIsRunning(false), [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setSeconds(0)
  }, [])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    formattedTime: formatTime(seconds),
  }
}
