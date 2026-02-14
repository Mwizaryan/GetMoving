import { useAuth } from './context/AuthContext'
import AuthForm from './components/AuthForm'
import FitnessDashboard from './components/FitnessDashboard'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <AuthForm />
  }

  return <FitnessDashboard />
}

export default App
