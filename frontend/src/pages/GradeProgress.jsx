import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './GradeProgress.css'

function GradeProgress() {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGrades()
  }, [])

  async function fetchGrades() {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('course_code')

    if (error) {
      console.error('Error loading grades:', error)
      setError('Unable to load grades.')
    } else {
      setGrades(data)
    }

    setLoading(false)
  }

  const overallProgress =
    grades.length > 0
      ? Math.round(
          grades.reduce(
            (total, item) => total + item.grade,
            0
          ) / grades.length
        )
      : 0

  const completedAssessments = grades.length

  const averageGrade = overallProgress

  const upcomingAssessments = 0

  if (loading) {
    return (
      <div className="grade-progress">
        <h1>Grades & Progress</h1>
        <p>Loading grades...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grade-progress">
        <h1>Grades & Progress</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="grade-progress">
      <h1>Grades & Progress</h1>

      <p className="grade-intro">
        View your course grades and academic progress.
      </p>

      <div className="grade-list">
        {grades.map((item) => (
          <div
            className="grade-card"
            key={item.id}
          >
            <h2>{item.course_title}</h2>

            <p>
              <strong>Course Code:</strong>{' '}
              {item.course_code}
            </p>

            <p>
              <strong>Grade:</strong> {item.grade}%
            </p>

            <p>
              <strong>Performance:</strong>{' '}
              {item.performance}
            </p>
          </div>
        ))}
      </div>

      <section className="progress-summary">
        <h2>Overall Progress</h2>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>

        <p>{overallProgress}%</p>
      </section>

      <section className="progress-stats">
        <div>
          <h3>Completed Assessments</h3>
          <p>{completedAssessments}</p>
        </div>

        <div>
          <h3>Upcoming Assessments</h3>
          <p>{upcomingAssessments}</p>
        </div>

        <div>
          <h3>Average Grade</h3>
          <p>{averageGrade}%</p>
        </div>
      </section>
    </div>
  )
}

export default GradeProgress