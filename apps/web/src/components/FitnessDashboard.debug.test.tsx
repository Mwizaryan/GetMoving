import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FitnessDashboard from './FitnessDashboard'

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

describe('FitnessDashboard Debug', () => {
  it('renders dashboard title and interacts', async () => {
    render(<FitnessDashboard />)
    expect(screen.getByText('Fitness Dashboard')).toBeTruthy()

    // 1. Select 'Upper Body' tab (default) and click 'Push-ups'
    const pushUpsCard = screen.getByText('Push-ups')
    // Click
    pushUpsCard.click()

    const setsInput = document.querySelector('#sets') as HTMLInputElement
    // fireEvent change
    fireEvent.change(setsInput, { target: { value: '3' } })
    // Mock alert
    window.alert = vi.fn()

    // Click Save
    const saveButton = screen.getByText('Save Workout')
    fireEvent.click(saveButton)

    expect(window.alert).toHaveBeenCalledWith('Workout saved!')
  })
})
