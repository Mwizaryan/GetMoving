export interface Exercise {
  id: string
  name: string
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
  { id: 'u1', name: 'Push-ups', category: 'Upper Body', icon: 'Activity' },
  { id: 'u2', name: 'Arm circles', category: 'Upper Body', icon: 'RotateCw' },
  { id: 'u3', name: 'Plank shoulder taps', category: 'Upper Body', icon: 'Dumbbell' },
  { id: 'a1', name: 'Sit-ups', category: 'Abs', icon: 'Activity' },
  { id: 'a2', name: 'Leg raises', category: 'Abs', icon: 'ArrowUp' },
  { id: 'a3', name: 'Plank hold', category: 'Abs', icon: 'Timer' },
  { id: 'l1', name: 'Squats', category: 'Legs', icon: 'ArrowDown' },
  { id: 'l2', name: 'Lunges', category: 'Legs', icon: 'Activity' },
  { id: 'l3', name: 'Calf raises', category: 'Legs', icon: 'ArrowUp' },
]
