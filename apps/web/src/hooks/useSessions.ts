import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { WorkoutSession } from '../types'

export function useSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setSessions([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'sessions'),
      where('ownerId', '==', userId),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkoutSession[] // This 'as WorkoutSession[]' fixes the error!

      setSessions(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  return { sessions, loading }
}
