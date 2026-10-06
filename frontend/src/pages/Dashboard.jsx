import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

function Dashboard() {
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .order('course_code')

    const { data: assignmentData, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date')

    if (courseError || assignmentError) {
      console.error('Error loading dashboard:', {
        courseError,
        assignmentError
      })

      setError('Unable to load dashboard data.')
      setLoading(false)
      return
    }

    setCourses(courseData || [])
    setAssignments(assignmentData || [])
    setLoading(false)
  }

  const overallProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce(
            (total, course) => total + course.progress,
            0
          ) / courses.length
        )
      : 0

  const upcomingAssignments = assignments.filter(
    (assignment) => assignment.status !== 'Submitted'
  )

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Student Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>Student Dashboard</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1>Student Dashboard</h1>

      <p>Welcome back, Student!</p>

      <section className="dashboard-section">
        <h2>My Courses</h2>

        <div className="course-list">
          {courses.map((course) => (
            <div
              className="course-card"
              key={course.id}
            >
              <h3>{course.department}</h3>

              <p>{course.title}</p>

              <p>
                Progress: {course.progress}%
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Upcoming Assignments</h2>

        {upcomingAssignments.length === 0 ? (
          <p>No upcoming assignments.</p>
        ) : (
          upcomingAssignments.map((assignment) => (
            <div
              className="assignment-card"
              key={assignment.id}
            >
              <h3>{assignment.title}</h3>

              <p>
                Course: {assignment.course_code}
              </p>

              <p>
                Due:{' '}
                {new Date(
                  assignment.due_date
                ).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          ))
        )}
      </section>

      <section className="dashboard-section">
        <h2>Academic Progress</h2>

        <p>
          Overall Progress: {overallProgress}%
        </p>

        <div className="progress-bar">
          <div
            className="progress"
            style={{
              width: `${overallProgress}%`
            }}
          ></div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard