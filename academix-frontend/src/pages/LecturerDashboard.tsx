function LecturerDashboard() {
  return (
    <div className="lecturer-dashboard">
      <h1>Lecturer Dashboard</h1>

      <p>Welcome, Lecturer.</p>

      <div className="dashboard-card">
        <h3>My Courses</h3>
        <p>Manage the courses you teach.</p>
        <button>View Courses</button>
      </div>

      <div className="dashboard-card">
        <h3>Assignments</h3>
        <p>Create and manage assignments.</p>
        <button>Manage Assignments</button>
      </div>

      <div className="dashboard-card">
        <h3>Student Grades</h3>
        <p>View and update student grades.</p>
        <button>View Grades</button>
      </div>
    </div>
  );
}

export default LecturerDashboard;