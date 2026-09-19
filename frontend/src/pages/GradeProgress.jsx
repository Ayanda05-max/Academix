import './GradeProgress.css'

function GradeProgress() {
  return (
    <div className="grade-progress">
      <h1>Grades and Progress</h1>

      <p className="progress-intro">
        View your grades and monitor your academic progress.
      </p>

      <section className="grades-section">
        <h2>Course Grades</h2>

        <div className="grade-card">
          <div>
            <h3>Computer Science</h3>
            <p>Introduction to Programming</p>
          </div>

          <div className="grade">
            <span>78%</span>
            <p>Good</p>
          </div>
        </div>

        <div className="grade-card">
          <div>
            <h3>Information Management</h3>
            <p>Database Systems</p>
          </div>

          <div className="grade">
            <span>72%</span>
            <p>Good</p>
          </div>
        </div>

        <div className="grade-card">
          <div>
            <h3>Mathematics</h3>
            <p>Discrete Mathematics</p>
          </div>

          <div className="grade">
            <span>85%</span>
            <p>Excellent</p>
          </div>
        </div>
      </section>

      <section className="progress-section">
        <h2>Overall Academic Progress</h2>

        <p>Overall Progress: 78%</p>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: '78%' }}
          ></div>
        </div>
      </section>

      <section className="progress-section">
        <h2>Completed Assessments</h2>

        <div className="assessment-summary">
          <div>
            <h3>8</h3>
            <p>Completed</p>
          </div>

          <div>
            <h3>3</h3>
            <p>Upcoming</p>
          </div>

          <div>
            <h3>78%</h3>
            <p>Average Grade</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GradeProgress