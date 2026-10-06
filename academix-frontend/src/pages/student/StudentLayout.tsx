import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getMyNotifications, isRead } from "../../services/studentService";
import "./student.css";
         
function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const firstName = localStorage.getItem("firstName");

  useEffect(() => {
    getMyNotifications()
      .then((list) => setUnread(list.filter((n) => !isRead(n)).length))
      .catch(() => setUnread(0));
  }, [location.pathname]);

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
    <div className="st-shell">
      <aside className="st-sidebar">
        <div className="st-logo">Academix</div>
        <nav className="st-nav">
          <NavLink to="/student" end>Dashboard</NavLink>
          <NavLink to="/student/courses">My Courses</NavLink>
           <NavLink to="/student/quizzes">Quizzes</NavLink>
          <NavLink to="/student/grades">Grades</NavLink>
          <NavLink to="/student/notifications">
            Notifications
            {unread > 0 && <span className="st-count">{unread}</span>}
          </NavLink>
        </nav>
      </aside>

      <div className="st-main">
        <header className="st-topbar">
          <span className="st-hello">Welcome{firstName ? `, ${firstName}` : ""}</span>
          <button type="button" className="st-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <div className="st-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;