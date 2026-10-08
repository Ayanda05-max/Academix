import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  ClipboardList,
  Inbox,
  FileQuestion,
  FolderOpen,
} from "lucide-react";
import "../student/student.css";

function LecturerLayout() {
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName");

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
        <aside className="student-sidebar">
          <p className="student-sidebar-title">LECTURER MENU</p>

          <NavLink to="/lecturer" end>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/lecturer/courses">
            <BookOpen size={18} />
            My Courses
          </NavLink>

          <NavLink to="/lecturer/lessons">
            <Library size={18} />
            Lessons
          </NavLink>

          <NavLink to="/lecturer/assignments">
            <ClipboardList size={18} />
            Assignments
          </NavLink>

          <NavLink to="/lecturer/submissions">
            <Inbox size={18} />
            Submissions
          </NavLink>

          <NavLink to="/lecturer/quizzes">
            <FileQuestion size={18} />
            Quizzes
          </NavLink>

          <NavLink to="/lecturer/resources">
            <FolderOpen size={18} />
            Resources
          </NavLink>
        </aside>

        <div className="lecturer-dashboard">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default LecturerLayout;