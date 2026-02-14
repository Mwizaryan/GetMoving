export interface WorkoutSession {
  id: string
  ownerId: string
  exerciseName: string
  sets: number
  reps: number
  weight: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timestamp: any
  isDeleted?: boolean
}
