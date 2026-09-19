import { useState } from 'react'
import { useParams } from 'react-router-dom'
import './AssignmentDetail.css'

function AssignmentDetail() {
  const { assignmentId } = useParams()

  const [submitted, setSubmitted] = useState(false)

  let assignment

  if (assignmentId === 'programming') {
    assignment = {
      title: 'Programming Task',
      course: 'Computer Science',
      dueDate: '23 October 2026',
      description:
        'Complete the programming exercises and submit your Java source code.',
      status: 'Submitted',
      instructions: [
        'Read the programming task requirements carefully.',
        'Complete all required programming exercises.',
        'Test your Java programs before submission.',
        'Submit your completed source code before the due date.'
      ]
    }
  } else if (assignmentId === 'mathematics') {
    assignment = {
      title: 'Discrete Mathematics Test',
      course: 'Mathematics',
      dueDate: '28 October 2026',
      description:
        'Prepare for the upcoming assessment covering sets, logic and mathematical structures.',
      status: 'Upcoming',
      instructions: [
        'Review the course notes carefully.',
        'Study sets and mathematical logic.',
        'Review mathematical structures covered in class.',
        'Prepare for the assessment before the test date.'
      ]
    }
  } else {
    assignment = {
      title: 'Database Design Assignment',
      course: 'Information Management',
      dueDate: '20 October 2026',
      description:
        'Design a database system and create an appropriate database structure based on the given requirements.',
      status: 'Not Submitted',
      instructions: [
        'Read the assignment requirements carefully.',
        'Design the required database structure.',
        'Implement the database tables and relationships.',
        'Submit your completed work before the due date.'
      ]
    }
  }

  return (
    <div className="assignment-detail">
      <h1>{assignment.title}</h1>

      <p className="assignment-course">
        {assignment.course}
      </p>

      <section className="assignment-info">
        <h2>Assignment Information</h2>

        <p>
          <strong>Due Date:</strong> {assignment.dueDate}
        </p>

        <p>
          <strong>Status:</strong>{' '}
          {submitted ? 'Submitted' : assignment.status}
        </p>
      </section>

      <section className="assignment-info">
        <h2>Description</h2>

        <p>{assignment.description}</p>
      </section>

      <section className="assignment-info">
        <h2>Instructions</h2>

        <ul>
          {assignment.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </section>

      <section className="assignment-info">
        <h2>Submission</h2>

        <p>
          {submitted
            ? 'Your assignment has been submitted successfully.'
            : 'Your assignment has not been submitted yet.'}
        </p>

        {!submitted && assignment.status === 'Not Submitted' && (
          <button onClick={() => setSubmitted(true)}>
            Submit Assignment
          </button>
        )}
      </section>
    </div>
  )
}

export default AssignmentDetail
