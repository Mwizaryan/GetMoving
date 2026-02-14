import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { useTimer } from '../hooks/useTimer'

const MOTIVATIONAL_MESSAGES = [
  "You're doing great! Keep pushing!",
  'Every rep counts! Stay focused!',
  "Feel the burn! You're getting stronger!",
  "Don't give up! You've got this!",
  'Push through the pain! Success is near!',
  'Your future self will thank you!',
  'Consistency is key! Keep going!',
  "You're stronger than you think!",
]

export function ActiveSession() {
  const { seconds, isRunning, start, pause, reset, formattedTime } = useTimer()
  const [messageIndex, setMessageIndex] = useState(0)

  // Update motivational message every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MOTIVATIONAL_MESSAGES.length)
    }, 15000) // 15 seconds

    return () => clearInterval(interval)
  }, [])

  // Progress bar: fills up to 60 seconds, then cycles
  const progress = ((seconds % 60) / 60) * 100

  return (
    <Card className="mb-6">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">Workout Timer</CardTitle>
        <CardDescription>{MOTIVATIONAL_MESSAGES[messageIndex]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Digital Clock */}
        <div className="text-center text-6xl font-bold tracking-tighter tabular-nums">
          {formattedTime}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <p className="text-center text-xs text-muted-foreground">
            {seconds === 0 ? 'Ready to start!' : `${seconds} seconds elapsed`}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <Button size="lg" className="h-14 w-14 rounded-full" onClick={start}>
              <Play className="h-6 w-6" />
            </Button>
          ) : (
            <Button size="lg" variant="outline" className="h-14 w-14 rounded-full" onClick={pause}>
              <Pause className="h-6 w-6" />
            </Button>
          )}
          <Button size="lg" variant="secondary" className="h-14 w-14 rounded-full" onClick={reset}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
