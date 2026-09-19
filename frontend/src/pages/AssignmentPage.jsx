import { Link } from 'react-router-dom'
import './AssignmentPage.css'

function AssignmentPage() {
  return (
    <div className="assignment-page">
      <h1>Assignments</h1>

      <p className="assignment-intro">
        View your assignments, due dates and submission status.
      </p>

      <div className="assignment-list">

        <div className="assignment-card">
          <h2>Database Design Assignment</h2>

          <p><strong>Course:</strong> Information Management</p>
          <p><strong>Due Date:</strong> 20 October 2026</p>
          <p><strong>Status:</strong> Not Submitted</p>

          <p className="assignment-description">
            Design a database system and create an appropriate database
            structure based on the given requirements.
          </p>

          <Link
            to="/assignment/database"
            className="assignment-button"
          >
            View Assignment
          </Link>
        </div>

        <div className="assignment-card">
          <h2>Programming Task</h2>

          <p><strong>Course:</strong> Computer Science</p>
          <p><strong>Due Date:</strong> 23 October 2026</p>
          <p><strong>Status:</strong> Submitted</p>

          <p className="assignment-description">
            Complete the programming exercises and submit your Java
            source code.
          </p>

          <Link
            to="/assignment/programming"
            className="assignment-button"
          >
            View Assignment
          </Link>
        </div>

        <div className="assignment-card">
          <h2>Discrete Mathematics Test</h2>

          <p><strong>Course:</strong> Mathematics</p>
          <p><strong>Due Date:</strong> 28 October 2026</p>
          <p><strong>Status:</strong> Upcoming</p>

          <p className="assignment-description">
            Prepare for the upcoming assessment covering sets, logic
            and mathematical structures.
          </p>

          <Link
            to="/assignment/mathematics"
            className="assignment-button"
          >
            View Assignment
          </Link>
        </div>

      </div>
    </div>
  )
}

export default AssignmentPage

