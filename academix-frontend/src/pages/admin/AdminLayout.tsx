import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "../student/student.css";

function AdminLayout() {
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
        {/* SIDE NAVBAR */}

        <aside className="student-sidebar">
          <p className="student-sidebar-title">ADMIN MENU</p>

          <NavLink to="/admin" end>
            Dashboard
          </NavLink>

          <NavLink to="/admin/users" end>
            Users
          </NavLink>

          <NavLink to="/admin/users/new">Create User</NavLink>

          <NavLink to="/admin/courses">Courses</NavLink>

          <NavLink to="/admin/enrolments">Enrolments</NavLink>
        </aside>

        {/* PAGE CONTENT */}

        <div className="admin-panel">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default AdminLayout;
