import { Link, useLocation, useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
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

  function linkClass(path: string) {
    return location.pathname === path ? "active" : "";
  }

  // The student, lecturer and admin pages have their own top bar and side menu
  if (
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/lecturer") ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to={token ? getDashboardPath(role) : "/login"} className="navbar-brand">
        <span>Academix</span>
      </Link>

      <div className="navbar-links">
        {/* LOGGED OUT */}
        {!token && (
          <Link
            className={linkClass("/login")}
            to="/login"
          >
            Login
          </Link>
        )}

        {/* ADMIN */}
        {token && role === "ADMIN" && (
          <>
            <Link
              className={linkClass("/admin")}
              to="/admin"
            >
              Admin Dashboard
            </Link>

            <Link
              className={linkClass("/register")}
              to="/register"
            >
              Create User
            </Link>
          </>
        )}

        {/* LECTURER */}
        {token && role === "LECTURER" && (
          <Link
            className={linkClass("/lecturer")}
            to="/lecturer"
          >
            Lecturer Dashboard
          </Link>
        )}

        {/* STUDENT */}
        {token && role === "STUDENT" && (
          <Link
            className={linkClass("/quiz")}
            to="/quiz"
          >
            Quizzes
          </Link>
        )}
      </div>

      {token && (
        <div className="navbar-user">
          {firstName && (
            <span className="navbar-welcome">
              Hi, {firstName}
            </span>
          )}

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function getDashboardPath(role: string | null) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "LECTURER") {
    return "/lecturer";
  }

  if (role === "STUDENT") {
    return "/quiz";
  }

  return "/login";
}

export default NavBar;
