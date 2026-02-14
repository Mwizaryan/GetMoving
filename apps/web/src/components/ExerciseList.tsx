import { WorkoutSession } from '../types'

interface ExerciseListProps {
  sessions: WorkoutSession[]
}

export function ExerciseList({ sessions }: ExerciseListProps) {
  if (!sessions?.length) {
    return <div className="text-center p-6 text-gray-500">No workouts found.</div>
  }

  return (
    <div className="space-y-4">
      {sessions.map(session => (
        <div
          key={session.id}
          className="border p-4 rounded-lg shadow-sm bg-white flex justify-between items-center"
        >
          <div>
            <h3 className="font-bold text-lg">{session.exerciseName}</h3>
            <p className="text-sm text-gray-600">
              {session.sets} sets • {session.reps} reps • {session.weight}kg
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {session.timestamp?.toDate
                ? session.timestamp.toDate().toLocaleDateString()
                : 'Just now'}
            </p>
          </div>
          {/* We will add the Delete button here later */}
        </div>
      ))}
    </div>
  )
}
