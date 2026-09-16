import './Dashboard.css'
function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Student Dashboard</h1>

      <p>Welcome back, Student!</p>

      <section className="dashboard-section">
        <h2>My Courses</h2>

        <div className="course-list">
          <div className="course-card">
            <h3>Computer Science</h3>
            <p>Introduction to Programming</p>
            <p>Progress: 75%</p>
          </div>

          <div className="course-card">
            <h3>Information Management</h3>
            <p>Database Systems</p>
            <p>Progress: 60%</p>
          </div>

          <div className="course-card">
            <h3>Mathematics</h3>
            <p>Discrete Mathematics</p>
            <p>Progress: 85%</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Upcoming Assignments</h2>

        <div className="assignment-card">
          <h3>Database Design Assignment</h3>
          <p>Course: Information Management</p>
          <p>Due: 20 September 2026</p>
        </div>

        <div className="assignment-card">
          <h3>Programming Task</h3>
          <p>Course: Computer Science</p>
          <p>Due: 23 September 2026</p>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Academic Progress</h2>

        <p>Overall Progress: 73%</p>

        <div className="progress-bar">
          <div className="progress" style={{ width: '73%' }}></div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard