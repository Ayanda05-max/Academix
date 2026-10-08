import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, BookOpen, ListChecks } from "lucide-react";
import "../student/student.css";

function AdminLayout() {
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
        <Link to="/admin" className="navbar-brand">
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
          <p className="student-sidebar-title">ADMIN MENU</p>

          <NavLink to="/admin" end>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/admin/users" end>
            <Users size={18} />
            Users
          </NavLink>

          <NavLink to="/admin/users/new">
            <UserPlus size={18} />
            Create User
          </NavLink>

          <NavLink to="/admin/courses">
            <BookOpen size={18} />
            Courses
          </NavLink>

          <NavLink to="/admin/enrolments">
            <ListChecks size={18} />
            Enrolments
          </NavLink>
        </aside>

        <div className="admin-panel">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default AdminLayout;