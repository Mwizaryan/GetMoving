import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FitnessDashboard from './FitnessDashboard'
import { addDoc } from 'firebase/firestore'
import React from 'react'

// 1. Mock the UI Components (Safe, no 'any' types)
vi.mock('./ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('./ui/card', () => ({
  Card: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div onClick={onClick}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// 2. Mock Firebase Config
vi.mock('../firebase/config', () => ({
  auth: { currentUser: { uid: 'test-user-id', displayName: 'Test User' } },
  db: {},
}))

// 3. Mock ActiveSession (Timer)
vi.mock('./ActiveSession', () => ({
  ActiveSession: () => <div>Timer Active</div>,
}))

// 4. Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    forEach: () => {}, // Clean mock to avoid 'callback' lint error
  }),
}))

describe('FitnessDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('allows selecting an exercise and saving a workout', async () => {
    render(<FitnessDashboard />)

    // --- STEP 1: Click "Start Workout" to leave the Home Screen ---
    const startWorkoutBtn = screen.getByText(/Start Workout/i)
    fireEvent.click(startWorkoutBtn)

    // --- STEP 2: Now "Push-ups" should be visible ---
    const pushUpsCard = await screen.findByText(/Push-ups/i)
    fireEvent.click(pushUpsCard)

    // --- STEP 3: Log the workout ---
    expect(screen.getByText(/Log Workout: Push-ups/i)).toBeInTheDocument()

    const setsInput = screen.getByLabelText(/Sets/i)
    const repsInput = screen.getByLabelText(/Reps/i)
    const weightInput = screen.getByLabelText(/Weight/i)

    fireEvent.change(setsInput, { target: { value: '3' } })
    fireEvent.change(repsInput, { target: { value: '10' } })
    fireEvent.change(weightInput, { target: { value: '25' } })

    const saveButton = screen.getByRole('button', { name: /Save/i })
    fireEvent.click(saveButton)

    // --- STEP 4: Assert Save was called correctly ---
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1)
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          exerciseName: 'Push-ups',
          sets: 3,
          reps: 10,
          weight: 25,
        })
      )
    })
  })
})
