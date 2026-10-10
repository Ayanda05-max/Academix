import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AssignmentDetail.css'

function AssignmentDetail() {
  const { assignmentId } = useParams()

  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId])

  async function fetchAssignment() {
    let courseCode

    if (assignmentId === 'database') {
      courseCode = 'IM101'
    } else if (assignmentId === 'programming') {
      courseCode = 'CS101'
    } else if (assignmentId === 'mathematics') {
      courseCode = 'MATH101'
    }

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('course_code', courseCode)
      .single()

    if (error) {
      console.error('Error loading assignment:', error)
      setError('Unable to load assignment.')
    } else {
      setAssignment(data)
    }

    setLoading(false)
  }

  async function submitAssignment() {
    setSubmitting(true)
    setError('')

    console.log(
      'Attempting to submit assignment:',
      assignment.id
    )

    const { data, error } = await supabase
      .from('assignments')
      .update({ status: 'Submitted' })
      .eq('id', assignment.id)
      .select()

    console.log('Supabase update data:', data)
    console.log('Supabase update error:', error)

    if (error) {
      console.error('Error submitting assignment:', error)
      setError(
        `Unable to submit assignment: ${error.message}`
      )
      setSubmitting(false)
      return
    }

    if (!data || data.length === 0) {
      console.error('No assignment was updated.')
      setError('No assignment was updated.')
      setSubmitting(false)
      return
    }

    setAssignment(data[0])
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="assignment-detail">
        <h1>Loading assignment...</h1>
      </div>
    )
  }

  if (error && !assignment) {
    return (
      <div className="assignment-detail">
        <h1>Assignment Not Found</h1>
        <p>{error}</p>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="assignment-detail">
        <h1>Assignment Not Found</h1>
        <p>The requested assignment could not be found.</p>
      </div>
    )
  }

  return (
    <div className="assignment-detail">
      <h1>{assignment.title}</h1>

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

      {error && (
        <p>{error}</p>
      )}

      <section className="assignment-info">
        <h2>Description</h2>
        <p>{assignment.description}</p>
      </section>

      <section className="assignment-info">
        <h2>Instructions</h2>
        <p>{assignment.instructions}</p>
      </section>

      {assignment.status === 'Not Submitted' && (
        <button
          className="assignment-submit-button"
          onClick={submitAssignment}
          disabled={submitting}
        >
          {submitting
            ? 'Submitting...'
            : 'Submit Assignment'}
        </button>
      )}
    </div>
  )
}

export default AssignmentDetail