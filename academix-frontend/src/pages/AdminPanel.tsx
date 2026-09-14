function AdminPanel() {
  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <p>Manage users, courses and system information.</p>

      <div className="admin-card">
        <h3>Users</h3>
        <p>View and manage student and lecturer accounts.</p>
        <button>Manage Users</button>
      </div>

      <div className="admin-card">
        <h3>Courses</h3>
        <p>View and manage available courses.</p>
        <button>Manage Courses</button>
      </div>

      <div className="admin-card">
        <h3>System</h3>
        <p>View general system information.</p>
        <button>View System</button>
      </div>
    </div>
  );
}

export default AdminPanel;