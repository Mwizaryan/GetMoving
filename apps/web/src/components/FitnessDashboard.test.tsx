import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FitnessDashboard from './FitnessDashboard'
import { addDoc } from 'firebase/firestore'

// Mock Firebase
vi.mock('../firebase/config', () => ({
  auth: { currentUser: { uid: 'test-user-id' } },
  db: {},
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getFirestore: vi.fn(),
}))

describe('FitnessDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('allows selecting an exercise and saving a workout', async () => {
    render(<FitnessDashboard />)

    // 1. Select 'Upper Body' tab (default) and click 'Push-ups'
    const pushUpsCard = screen.getByText('Push-ups')
    fireEvent.click(pushUpsCard)

    // 2. Form should appear
    expect(screen.getByText('Log Workout: Push-ups')).toBeInTheDocument()

    // 3. Fill out the form
    const setsInput = screen.getByLabelText(/Sets/i)
    const repsInput = screen.getByLabelText(/Reps/i)
    const weightInput = screen.getByLabelText(/Weight/i)

    fireEvent.change(setsInput, { target: { value: '3' } })
    fireEvent.change(repsInput, { target: { value: '10' } })
    fireEvent.change(weightInput, { target: { value: '0' } })

    // 4. Click Save
    const saveButton = screen.getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    // 5. Assert addDoc was called with correct data
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1)
      expect(addDoc).toHaveBeenCalledWith(
        undefined, // collection mock result (undefined since we didn't return anything from collection())
        expect.objectContaining({
          ownerId: 'test-user-id',
          exerciseName: 'Push-ups',
          sets: 3,
          reps: 10,
          weight: 0,
        })
      )
    })
  })
})
