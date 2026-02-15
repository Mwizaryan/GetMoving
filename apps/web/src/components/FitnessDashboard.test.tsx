import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FitnessDashboard from './FitnessDashboard'
import { addDoc } from 'firebase/firestore'
import React from 'react'

vi.mock('../firebase/config', () => ({ auth: { currentUser: { uid: 'test-user' } }, db: {} }))
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ forEach: () => {} }),
}))
vi.mock('./ActiveSession', () => ({ ActiveSession: () => <div>Timer</div> }))

describe('FitnessDashboard', () => {
  it('allows logging a workout', async () => {
    render(<FitnessDashboard />)
    fireEvent.click(screen.getByText(/Start Workout/i))
    const pushUps = await screen.findByText(/Push-ups/i)
    fireEvent.click(pushUps)
    fireEvent.change(screen.getByLabelText(/Sets/i), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/Reps/i), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/Weight/i), { target: { value: '0' } })
    fireEvent.click(screen.getByText(/Save Workout/i))
    await waitFor(() => expect(addDoc).toHaveBeenCalled())
  })
})
