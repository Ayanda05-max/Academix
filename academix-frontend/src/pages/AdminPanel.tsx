import { useState } from "react";

type User = {
  id: number;
  name: string;
  role: string;
};

function AdminPanel() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Thabo",
      role: "Student",
    },
    {
      id: 2,
      name: "Naledi",
      role: "Lecturer",
    },
  ]);

  function handleDeleteUser(id: number) {
    const updatedUsers = users.filter((user) => user.id !== id);

    setUsers(updatedUsers);
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <p>Manage users and system information.</p>

      <h2>Users</h2>

      <div className="admin-users">
        {users.map((user) => (
          <div className="admin-card" key={user.id}>
            <h3>{user.name}</h3>

            <p>Role: {user.role}</p>

            <button onClick={() => handleDeleteUser(user.id)}>
              Delete User
            </button>
          </div>
        ))}
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