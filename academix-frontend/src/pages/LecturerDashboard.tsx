import { Link } from "react-router-dom";

function LecturerDashboard() {
  return (
    <div className="lecturer-dashboard">
      <h1>Lecturer Dashboard</h1>
      <p>Welcome, Lecturer. Manage your teaching activities here.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>My Courses</h3>
          <p>View the courses you are currently teaching.</p>
          <button>View Courses</button>
        </div>

        <div className="dashboard-card">
          <h3>Assignments</h3>
          <p>Create and manage student assignments.</p>
          <button>Manage Assignments</button>
        </div>

        <div className="dashboard-card">
          <h3>Quiz Management</h3>
          <p>Create, edit and delete quizzes.</p>

          <Link to="/quiz">
            <button>Manage Quizzes</button>
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Student Grades</h3>
          <p>View and manage student marks.</p>
          <button>View Grades</button>
        </div>
      </div>
    </div>
  );
}

export default LecturerDashboard;