import { WorkoutSession } from '../types'
import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../firebase/config'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Dumbbell,
  Activity,
  Footprints,
  History,
  Trophy,
  ArrowLeft,
  Settings,
  Trash2,
} from 'lucide-react'
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

type ViewType = 'home' | 'workout' | 'history' | 'settings'

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
              sets: data.sets,
              reps: data.reps,
              weight: data.weight,
              timestamp: data.timestamp.toDate(),
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
            .filter((value, index, self) => self.indexOf(value) === index)

          let currentStreak = 0
          const today = format(new Date(), 'yyyy-MM-dd')
          const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

          if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
            let checkDate = uniqueDates.includes(today) ? new Date() : subDays(new Date(), 1)

            while (uniqueDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
              currentStreak++
              checkDate = subDays(checkDate, 1)
            }
          }
          setStreak(currentStreak)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchWorkoutStats()
  }, [])

  const handleSave = async () => {
    if (!selectedExercise || !sets || !reps || !weight || !auth.currentUser) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'sessions'), {
        exerciseName: selectedExercise,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight),
        ownerId: auth.currentUser.uid,
        timestamp: new Date(),
        isDeleted: false,
      })

      alert('Workout Saved!')
      setSets('')
      setReps('')
      setWeight('')
      setSelectedExercise(null)
      setCurrentView('home')

      // Refresh statistics (simplified for demo, usually you'd refetch or update state localy)
      window.location.reload()
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Failed to save workout')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return

    try {
      const docRef = doc(db, 'sessions', id)
      await updateDoc(docRef, { isDeleted: true })
      setWorkoutHistory(prev => prev.filter(w => w.id !== id))
      setTotalWorkouts(prev => prev - 1)
    } catch (error) {
      console.error('Error deleting workout:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (currentView === 'workout' && selectedExercise) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20">
        <Button variant="ghost" onClick={() => setSelectedExercise(null)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Log Workout: {selectedExercise}</CardTitle>
            <CardDescription>Enter your sets, reps, and weight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                placeholder="0"
                value={sets}
                onChange={e => setSets(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                placeholder="0"
                value={reps}
                onChange={e => setReps(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Workout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Dumbbell className="text-blue-600" />
            Hytel Fitness
          </h1>
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        {currentView === 'home' && (
          <>
            <section className="grid grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="text-blue-600 h-5 w-5" />
                    <span className="text-2xl font-bold">{totalWorkouts}</span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium">Total Workouts</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="text-orange-600 h-5 w-5" />
                    <span className="text-2xl font-bold">{streak}</span>
                  </div>
                  <p className="text-xs text-orange-600 font-medium">Day Streak</p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Quick Stats
              </h2>
              <Card>
                <CardContent className="divide-y p-0">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Footprints className="text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Last Session</p>
                        <p className="text-xs text-gray-500">
                          {lastActive ? format(lastActive, 'MMM d, yyyy') : 'No workouts yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <ActiveSession />

            <Button
              size="lg"
              className="w-full h-14 text-lg"
              onClick={() => setCurrentView('workout')}
            >
              Start Workout
            </Button>
          </>
        )}

        {currentView === 'workout' && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setCurrentView('home')} className="-ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>

            <Tabs defaultValue="upper">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upper">Upper</TabsTrigger>
                <TabsTrigger value="abs">Abs</TabsTrigger>
                <TabsTrigger value="legs">Legs</TabsTrigger>
              </TabsList>

              {(Object.keys(EXERCISES) as Array<keyof typeof EXERCISES>).map(category => (
                <TabsContent key={category} value={category} className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-3">
                    {EXERCISES[category].map(exercise => (
                      <Card
                        key={exercise.id}
                        className="cursor-pointer hover:border-blue-300 transition-colors"
                        onClick={() => setSelectedExercise(exercise.exerciseName)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <span className="font-medium">{exercise.exerciseName}</span>
                          <Dumbbell className="h-4 w-4 text-gray-300" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Workout History</h2>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('home')}>
                Back
              </Button>
            </div>

            <div className="space-y-4">
              {workoutHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-500 border rounded-lg bg-white">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No workouts recorded yet.</p>
                </div>
              ) : (
                workoutHistory.map(session => (
                  <Card key={session.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{session.exerciseName}</h3>
                        <p className="text-sm text-gray-600">
                          {session.sets} sets • {session.reps} reps • {session.weight}kg
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(session.timestamp, 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold">Settings</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Signed in as {auth.currentUser?.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 z-10">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${currentView === 'home' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setCurrentView('home')}
          >
            <Dumbbell className="h-6 w-6" />
            <span className="text-[10px]">Home</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${currentView === 'history' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setCurrentView('history')}
          >
            <History className="h-6 w-6" />
            <span className="text-[10px]">History</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${currentView === 'settings' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setCurrentView('settings')}
          >
            <Settings className="h-6 w-6" />
            <span className="text-[10px]">Settings</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
