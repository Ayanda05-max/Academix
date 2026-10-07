import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "../student/student.css";

function LecturerLayout() {
  const navigate = useNavigate();

  const firstName = localStorage.getItem("firstName");

  // Log out
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/login");
  }

  return (
    <>
      {/* TOP BAR (same classes as NavBar.tsx) */}

      <nav className="navbar">
        <Link to="/lecturer" className="navbar-brand">
          <span>Academix</span>
        </Link>

        <div className="navbar-links"></div>

        <div className="navbar-user">
          {firstName && (
            <span className="navbar-welcome">Hi, {firstName}</span>
          )}

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="student-shell">
        {/* SIDE NAVBAR */}

        <aside className="student-sidebar">
          <p className="student-sidebar-title">LECTURER MENU</p>

          <NavLink to="/lecturer" end>
            Dashboard
          </NavLink>

          <NavLink to="/lecturer/courses">My Courses</NavLink>

          <NavLink to="/lecturer/lessons">Lessons</NavLink>

          <NavLink to="/lecturer/assignments">Assignments</NavLink>

          <NavLink to="/lecturer/submissions">Submissions</NavLink>

          <NavLink to="/lecturer/quizzes">Quizzes</NavLink>
        </aside>

        {/* PAGE CONTENT */}

        <div className="lecturer-dashboard">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default LecturerLayout;
