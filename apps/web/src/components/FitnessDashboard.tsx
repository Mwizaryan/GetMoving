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
import { format } from 'date-fns'
import { ActiveSession } from './ActiveSession'

const EXERCISES = {
  upper: [
    { id: 'pushups', name: 'Push-ups' },
    { id: 'arm-circles', name: 'Arm Circles' },
    { id: 'plank-taps', name: 'Plank Shoulder Taps' },
  ],
  abs: [
    { id: 'situps', name: 'Sit-Ups' },
    { id: 'leg-raises', name: 'Leg Raises' },
    { id: 'plank-hold', name: 'Plank Hold' },
  ],
  legs: [
    { id: 'squats', name: 'Squats' },
    { id: 'lunges', name: 'Lunges' },
    { id: 'calf-raises', name: 'Calf Raises' },
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

  // Fetch workout stats
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

        querySnapshot.forEach(doc => {
          const data = doc.data()
          // Filter out soft-deleted items
          if (data.isDeleted !== true) {
            workouts.push({
              id: doc.id,
              ownerId: data.ownerId,
              exerciseName: data.exerciseName,
              sets: data.sets,
              reps: data.reps,
              weight: data.weight,
              timestamp: data.timestamp.toDate(),
              isDeleted: data.isDeleted,
            })
          }
        })

        setWorkoutHistory(workouts)
        setTotalWorkouts(workouts.length)
        if (workouts.length > 0) {
          setLastActive(workouts[0].timestamp)
        }
      } catch (error) {
        console.error('Error fetching workout stats: ', error)
      }
    }

    fetchWorkoutStats()
  }, [currentView])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out: ', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Saving...') // Debug log
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
      alert('Workout Saved!')
      // Reset form
      setSets('')
      setReps('')
      setWeight('')
      setSelectedExercise(null)
      // Navigate back to home
      setCurrentView('home')
    } catch (error) {
      console.error('Error adding document: ', error)
      alert('Error saving workout')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return

    try {
      await updateDoc(doc(db, 'sessions', workoutId), {
        isDeleted: true,
      })
      // Refresh the workout history
      setWorkoutHistory(prev => prev.filter(w => w.id !== workoutId))
      setTotalWorkouts(prev => prev - 1)
    } catch (error) {
      console.error('Error deleting workout: ', error)
      alert('Error deleting workout')
    }
  }

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return

    const confirmation = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmation !== 'DELETE') {
      alert('Account deletion cancelled')
      return
    }

    try {
      // Update user document to mark account as deleted
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        accountStatus: 'deleted',
      })
      alert('Account marked for deletion. You will be logged out.')
      await signOut(auth)
    } catch (error) {
      console.error('Error deleting account: ', error)
      alert('Error deleting account')
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getUserName = () => {
    return auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User'
  }

  return (
    <>
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="font-bold text-xl">GetMoving</div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* HOME VIEW */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Greeting Header with Settings */}
            <div className="text-center space-y-2 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setCurrentView('settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <h1 className="text-4xl font-bold">
                {getGreeting()}, {getUserName()}
              </h1>
              <p className="text-muted-foreground">Ready to crush your fitness goals?</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <CardHeader className="p-0 pb-2">
                  <CardDescription className="text-sm">Total Workouts</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-3xl font-bold">{totalWorkouts}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 pb-2">
                  <CardDescription className="text-sm">Streak</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-500" />
                    <span className="text-3xl font-bold">3 Days</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 pb-2">
                  <CardDescription className="text-sm">Last Active</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-bold">
                    {lastActive ? format(lastActive, 'MMM d') : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Card
                className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-primary bg-primary/5"
                onClick={() => setCurrentView('workout')}
              >
                <CardContent className="p-0 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Dumbbell className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">Start Workout</h3>
                    <p className="text-muted-foreground mt-2">Begin your training session</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2"
                onClick={() => setCurrentView('history')}
              >
                <CardContent className="p-0 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                  <div className="p-4 rounded-full bg-muted">
                    <History className="h-12 w-12" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">View History</h3>
                    <p className="text-muted-foreground mt-2">Track your progress</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* WORKOUT VIEW */}
        {currentView === 'workout' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('home')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Hub
              </Button>
            </div>

            <h1 className="text-3xl font-bold text-center">Start Workout</h1>

            {/* Active Timer */}
            <ActiveSession />

            <Tabs defaultValue="upper" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="upper" className="gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Upper Body
                </TabsTrigger>
                <TabsTrigger value="abs" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Abs
                </TabsTrigger>
                <TabsTrigger value="legs" className="gap-2">
                  <Footprints className="h-4 w-4" />
                  Legs
                </TabsTrigger>
              </TabsList>

              {Object.entries(EXERCISES).map(([category, exercises]) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {exercises.map(exercise => (
                      <Card
                        key={exercise.id}
                        className={`cursor-pointer transition-all hover:bg-accent ${
                          selectedExercise === exercise.name
                            ? 'border-primary ring-2 ring-primary'
                            : ''
                        }`}
                        onClick={() => setSelectedExercise(exercise.name)}
                      >
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg text-center">{exercise.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {selectedExercise && (
              <Card className="mt-8 p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle>Log Workout: {selectedExercise}</CardTitle>
                  <CardDescription>Enter your stats for this set</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sets">Sets</Label>
                        <Input
                          id="sets"
                          type="number"
                          placeholder="0"
                          value={sets}
                          onChange={e => setSets(e.target.value)}
                          required
                          min="1"
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
                          required
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="0"
                          value={weight}
                          onChange={e => setWeight(e.target.value)}
                          required
                          min="0"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Workout'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* HISTORY VIEW */}
        {currentView === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('home')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Hub
              </Button>
            </div>

            <h1 className="text-3xl font-bold text-center">Workout History</h1>

            <div className="space-y-4">
              {workoutHistory.length === 0 ? (
                <Card className="p-6">
                  <CardContent className="p-0 text-center text-muted-foreground">
                    No workouts yet. Start your first workout to see it here!
                  </CardContent>
                </Card>
              ) : (
                workoutHistory.map(workout => (
                  <Card key={workout.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-bold text-lg">{workout.exerciseName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(workout.timestamp, 'MMMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-6 text-sm items-center">
                        <div className="text-center">
                          <p className="text-muted-foreground">Sets</p>
                          <p className="font-bold text-lg">{workout.sets}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Reps</p>
                          <p className="font-bold text-lg">{workout.reps}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Weight</p>
                          <p className="font-bold text-lg">{workout.weight} lbs</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {currentView === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('home')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Hub
              </Button>
            </div>

            <h1 className="text-3xl font-bold text-center">Settings</h1>

            {/* Danger Zone */}
            <Card className="p-6 border-destructive">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that will permanently affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
