export interface Exercise {
  id: string
  exerciseName: string
  category: 'Upper Body' | 'Abs' | 'Legs'
  icon: string // Name of the Lucide icon
}

export interface Session {
  id?: string
  date: Date
  duration: number // in seconds
  completed: boolean
}

export type Category = Exercise['category']

export const EXERCISES: Exercise[] = [
  { id: 'u1', exerciseName: 'Push-ups', category: 'Upper Body', icon: 'Activity' },
  { id: 'u2', exerciseName: 'Arm circles', category: 'Upper Body', icon: 'RotateCw' },
  { id: 'u3', exerciseName: 'Plank shoulder taps', category: 'Upper Body', icon: 'Dumbbell' },
  { id: 'a1', exerciseName: 'Sit-ups', category: 'Abs', icon: 'Activity' },
  { id: 'a2', exerciseName: 'Leg raises', category: 'Abs', icon: 'ArrowUp' },
  { id: 'a3', exerciseName: 'Plank hold', category: 'Abs', icon: 'Timer' },
  { id: 'l1', exerciseName: 'Squats', category: 'Legs', icon: 'ArrowDown' },
  { id: 'l2', exerciseName: 'Lunges', category: 'Legs', icon: 'Activity' },
  { id: 'l3', exerciseName: 'Calf raises', category: 'Legs', icon: 'ArrowUp' },
]
