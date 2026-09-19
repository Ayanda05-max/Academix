import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navigation from './components/Navigation'

import Dashboard from './pages/Dashboard'
import CourseCatalog from './pages/CourseCatalog'
import CourseDetail from './pages/CourseDetail'
import AssignmentPage from './pages/AssignmentPage'
import AssignmentDetail from './pages/AssignmentDetail'
import GradeProgress from './pages/GradeProgress'

function App() {
  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/courses" element={<CourseCatalog />} />

        <Route
          path="/course/:courseId"
          element={<CourseDetail />}
        />

        <Route path="/assignments" element={<AssignmentPage />} />

        <Route
          path="/assignment/:assignmentId"
          element={<AssignmentDetail />}
        />

        <Route path="/grades" element={<GradeProgress />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
