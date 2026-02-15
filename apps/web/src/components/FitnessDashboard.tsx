import { WorkoutSession } from '../types'
import { useState, useEffect } from 'react'
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../firebase/config'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardDescription, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dumbbell, Activity, History, Trophy, ArrowLeft } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ActiveSession } from './ActiveSession'

const EXERCISES = {
  upper: [
    { id: 'pushups', exerciseName: 'Push-ups' },
    { id: 'arm-circles', exerciseName: 'Arm Circles' },
    { id: 'plank-taps', exerciseName: 'Plank Shoulder Taps' },
  ],
  abs: [
    { id: 'situps', exerciseName: 'Sit-Ups' },
    { id: 'leg-raises', exerciseName: 'Leg Raises' },
    { id: 'plank-hold', exerciseName: 'Plank Hold' },
  ],
  legs: [
    { id: 'squats', exerciseName: 'Squats' },
    { id: 'lunges', exerciseName: 'Lunges' },
    { id: 'calf-raises', exerciseName: 'Calf Raises' },
  ],
}

type ViewType = 'home' | 'workout' | 'history'

export default function FitnessDashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [loading, setLoading] = useState(false)
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([])
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [lastActive, setLastActive] = useState<Date | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const fetchWorkoutStats = async () => {
      if (!auth.currentUser) return

      try {
        const q = query(
          collection(db, 'sessions'),
          where('ownerId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc')
        )
        const querySnapshot = await getDocs(q)
        const workouts: WorkoutSession[] = []

        querySnapshot.forEach(docSnap => {
          const data = docSnap.data()
          if (data.isDeleted !== true) {
            workouts.push({
              id: docSnap.id,
              ownerId: data.ownerId,
              exerciseName: data.exerciseName || data.exercise || 'Unknown',
              sets: Number(data.sets),
              reps: Number(data.reps),
              weight: Number(data.weight),
              timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
              isDeleted: !!data.isDeleted,
            })
          }
        })

        setWorkoutHistory(workouts)
        setTotalWorkouts(workouts.length)

        if (workouts.length > 0) {
          setLastActive(workouts[0].timestamp)
          const uniqueDates = workouts
            .map(w => format(w.timestamp, 'yyyy-MM-dd'))
            .filter((v, i, a) => a.indexOf(v) === i)

          let s = 0
          let d = new Date()
          if (uniqueDates[0] !== format(d, 'yyyy-MM-dd')) d = subDays(d, 1)
          for (const date of uniqueDates) {
            if (date === format(d, 'yyyy-MM-dd')) {
              s++
              d = subDays(d, 1)
            } else break
          }
          setStreak(s)
        } else {
          setStreak(0)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchWorkoutStats()
  }, [currentView])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExercise || !auth.currentUser) return
    setLoading(true)
    try {
      await addDoc(collection(db, 'sessions'), {
        ownerId: auth.currentUser.uid,
        exerciseName: selectedExercise,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        timestamp: new Date(),
        isDeleted: false,
      })
      setSets('')
      setReps('')
      setWeight('')
      setSelectedExercise(null)
      setCurrentView('home')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between px-4 max-w-4xl mx-auto">
          <div className="font-bold text-xl">GetMoving</div>
          <Button variant="outline" size="sm" onClick={() => signOut(auth)}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        {currentView === 'home' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center mt-4">Fitness Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Trophy className="mx-auto h-6 w-6 text-yellow-500 mb-2" />
                <CardDescription>Workouts</CardDescription>
                <CardTitle className="text-2xl">{totalWorkouts}</CardTitle>
              </Card>
              <Card className="p-4 text-center">
                <Activity className="mx-auto h-6 w-6 text-orange-500 mb-2" />
                <CardDescription>Streak</CardDescription>
                <CardTitle className="text-2xl">
                  {streak} {streak === 1 ? 'Day' : 'Days'}
                </CardTitle>
              </Card>
              <Card className="p-4 text-center">
                <History className="mx-auto h-6 w-6 text-blue-500 mb-2" />
                <CardDescription>Last Active</CardDescription>
                <CardTitle className="text-xl">
                  {lastActive ? format(lastActive, 'MMM d') : 'N/A'}
                </CardTitle>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button size="lg" className="h-32 text-xl" onClick={() => setCurrentView('workout')}>
                <Dumbbell className="mr-4 h-8 w-8" /> Start Workout
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-32 text-xl"
                onClick={() => setCurrentView('history')}
              >
                <History className="mr-4 h-8 w-8" /> History
              </Button>
            </div>
          </div>
        )}

        {currentView === 'workout' && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setCurrentView('home')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <ActiveSession />
            <Tabs defaultValue="upper">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upper">Upper</TabsTrigger>
                <TabsTrigger value="abs">Abs</TabsTrigger>
                <TabsTrigger value="legs">Legs</TabsTrigger>
              </TabsList>
              {Object.entries(EXERCISES).map(([cat, exs]) => (
                <TabsContent
                  key={cat}
                  value={cat}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"
                >
                  {exs.map(ex => (
                    <Card
                      key={ex.id}
                      className={`p-4 cursor-pointer text-center ${selectedExercise === ex.exerciseName ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedExercise(ex.exerciseName)}
                    >
                      <CardTitle className="text-base">{ex.exerciseName}</CardTitle>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
            {selectedExercise && (
              <Card className="p-6">
                <CardTitle className="mb-4">Log {selectedExercise}</CardTitle>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sets">Sets</Label>
                      <Input
                        id="sets"
                        type="number"
                        value={sets}
                        onChange={e => setSets(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reps">Reps</Label>
                      <Input
                        id="reps"
                        type="number"
                        value={reps}
                        onChange={e => setReps(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Save Workout
                  </Button>
                </form>
              </Card>
            )}
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setCurrentView('home')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h2 className="text-2xl font-bold">History</h2>
            {workoutHistory.map(w => (
              <Card key={w.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{w.exerciseName}</p>
                  <p className="text-xs text-muted-foreground">{format(w.timestamp, 'PPp')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm">
                    {w.sets}×{w.reps} @ {w.weight}lb
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
