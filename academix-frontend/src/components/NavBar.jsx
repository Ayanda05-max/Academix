function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🎓 Academix</div>

      <div className="nav-links">
        <a href="/">Dashboard</a>
        <a href="/courses">Courses</a>
        <a href="/my-courses">My Courses</a>
        <a href="/login">Login</a>
      </div>
    </nav>
  );
}

export default Navbar;