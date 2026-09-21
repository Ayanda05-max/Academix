import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
      <Link to="/lecturer">Lecturer Dashboard</Link>
      <Link to="/quiz">Quiz Management</Link>
      <Link to="/admin">Admin Panel</Link>
    </nav>
  );
}

export default NavBar;