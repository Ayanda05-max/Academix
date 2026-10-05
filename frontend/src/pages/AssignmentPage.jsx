
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AssignmentPage.css'

function AssignmentPage() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAssignments()
  }, [])

  async function fetchAssignments() {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date')

    if (error) {
      console.error('Error loading assignments:', error)
      setError('Unable to load assignments.')
    } else {
      setAssignments(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="assignment-page">
        <h1>Assignments</h1>
        <p>Loading assignments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="assignment-page">
        <h1>Assignments</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="assignment-page">
      <h1>Assignments</h1>

      <p className="assignment-intro">
        View your assignments, due dates and submission status.
      </p>

      <div className="assignment-list">
        {assignments.map((assignment) => (
          <div
            className="assignment-card"
            key={assignment.id}
          >
            <h2>{assignment.title}</h2>

            <p>
              <strong>Course:</strong> {assignment.course_code}
            </p>

            <p>
              <strong>Due Date:</strong>{' '}
              {new Date(assignment.due_date).toLocaleDateString(
                'en-GB',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }
              )}
            </p>

            <p>
              <strong>Status:</strong> {assignment.status}
            </p>

            <p className="assignment-description">
              {assignment.description}
            </p>

            <Link
              to={`/assignment/${assignment.course_code === 'IM101'
                ? 'database'
                : assignment.course_code === 'CS101'
                ? 'programming'
                : 'mathematics'
              }`}
              className="assignment-button"
            >
              View Assignment
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AssignmentPage