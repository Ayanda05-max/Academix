import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/courses">Courses</Link>
      <Link to="/my-courses">My Courses</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
}

export default NavBar;