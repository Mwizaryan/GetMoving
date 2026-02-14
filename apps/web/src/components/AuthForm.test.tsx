import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AuthForm from './AuthForm'

// Mock Firebase auth
vi.mock('../firebase/config', () => ({
  auth: {},
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(),
}))

describe('AuthForm', () => {
  it('toggles between Login and Sign Up modes', () => {
    render(<AuthForm />)

    // Initially in Login mode
    const submitButton = screen.getByRole('button', { name: /login/i })
    expect(submitButton).toBeInTheDocument()

    // Click 'Need an account?'
    const toggleButton = screen.getByText('Need an account?')
    fireEvent.click(toggleButton)

    // Should now be in Sign Up mode
    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    expect(signUpButton).toBeInTheDocument()

    // Toggle back
    const toggleBack = screen.getByText('Already have an account?')
    fireEvent.click(toggleBack)

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })
})
