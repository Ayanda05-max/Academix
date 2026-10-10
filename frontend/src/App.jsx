import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

import Navigation from './components/Navigation'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CourseCatalog from './pages/CourseCatalog'
import CourseDetail from './pages/CourseDetail'
import AssignmentPage from './pages/AssignmentPage'
import AssignmentDetail from './pages/AssignmentDetail'
import GradeProgress from './pages/GradeProgress'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function getSession() {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    setSession(session)
    setLoading(false)
  }

  if (loading) {
    return <p>Loading Academix...</p>
  }

  return (
    <BrowserRouter>
      {session && <Navigation />}

      <Routes>
        <Route
          path="/login"
          element={
            session
              ? <Navigate to="/" replace />
              : <Login />
          }
        />

        <Route
          path="/"
          element={
            session
              ? <Dashboard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/courses"
          element={
            session
              ? <CourseCatalog />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/course/:courseId"
          element={
            session
              ? <CourseDetail />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/assignments"
          element={
            session
              ? <AssignmentPage />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/assignment/:assignmentId"
          element={
            session
              ? <AssignmentDetail />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/grades"
          element={
            session
              ? <GradeProgress />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={session ? '/' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App