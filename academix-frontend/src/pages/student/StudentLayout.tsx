import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileQuestion,
  FolderOpen,
  Award,
  Bell,
} from "lucide-react";
import "./student.css";

function StudentLayout() {
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
        <Link to="/student" className="navbar-brand">
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
          <p className="student-sidebar-title">STUDENT MENU</p>

          <NavLink to="/student" end>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/student/courses">
            <BookOpen size={18} />
            My Courses
          </NavLink>

          <NavLink to="/student/assignments">
            <ClipboardList size={18} />
            Assignments
          </NavLink>

          <NavLink to="/student/quizzes">
            <FileQuestion size={18} />
            Quizzes
          </NavLink>

          <NavLink to="/student/resources">
            <FolderOpen size={18} />
            Resources
          </NavLink>

          <NavLink to="/student/grades">
            <Award size={18} />
            Grades
          </NavLink>

          <NavLink to="/student/notifications">
            <Bell size={18} />
            Notifications
          </NavLink>
        </aside>

        <div className="lecturer-dashboard student-portal">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default StudentLayout;