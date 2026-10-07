import { useEffect, useState } from "react";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadUsers();
  }, []);

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  // Load users
  async function loadUsers() {
    if (!token) {
      showMessage("You must log in first.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: User[] = await response.json();
        setUsers(data);
      } else {
        showMessage("Could not load users.", "error");
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Delete user
  async function deleteUser(id: number) {
    if (!token) {
      showMessage("You must log in first.", "error");
      return;
    }

    const user = users.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        user ? `${user.firstName} ${user.lastName}` : "this user"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.id !== id)
        );

        showMessage("User deleted successfully.", "success");
      } else {
        showMessage("Could not delete user.", "error");
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    }
  }

  // Copy user information
  async function copyUserInfo(user: User) {
    const userInfo = [
      `Name: ${user.firstName} ${user.lastName}`,
      `Email: ${user.email}`,
      `Role: ${formatRole(user.role)}`,
      `User ID: ${user.id}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(userInfo);
      showMessage(
        `${user.firstName} ${user.lastName}'s information copied.`,
        "success"
      );
    } catch (error) {
      showMessage("Could not copy user information.", "error");
      console.error(error);
    }
  }

  function getInitials(user: User) {
    const firstInitial = user.firstName?.charAt(0).toUpperCase() || "";
    const lastInitial = user.lastName?.charAt(0).toUpperCase() || "";

    return `${firstInitial}${lastInitial}`;
  }

  function formatRole(role: string) {
    if (!role) {
      return "User";
    }

    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  return (
    <>
      {/* HEADER */}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ADMIN PORTAL</p>

          <h1>Users</h1>

          <p className="dashboard-description">
            View registered accounts and their assigned roles.
          </p>
        </div>
      </header>

      {message && (
        <div
          className={
            messageType === "success"
              ? "admin-message admin-message-success"
              : "admin-message admin-message-error"
          }
        >
          <span>{message}</span>

          <button
            type="button"
            className="message-close"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading administration data...</div>
      ) : (
        <section className="admin-section admin-modern-section">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">USER MANAGEMENT</p>
              <h2>Users</h2>
              <p>View registered accounts and their assigned roles.</p>
            </div>

            <span className="section-count">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>

          {users.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No users found</h3>
              <p>Registered Academix users will appear here.</p>
            </div>
          ) : (
            <div className="admin-user-list">
              {users.map((user) => (
                <article className="admin-user-row" key={user.id}>
                  <div className="admin-user-main">
                    <div className="user-avatar">{getInitials(user)}</div>

                    <div className="admin-user-details">
                      <div className="admin-user-name-row">
                        <h3>
                          {user.firstName} {user.lastName}
                        </h3>

                        <span
                          className={`role-badge role-${user.role.toLowerCase()}`}
                        >
                          {formatRole(user.role)}
                        </span>
                      </div>

                      <p>{user.email}</p>
                    </div>
                  </div>

                  <div className="admin-row-actions">
                    <span className="record-id">ID #{user.id}</span>

                    <button
                      type="button"
                      className="copy-outline-button"
                      onClick={() => copyUserInfo(user)}
                    >
                      Copy Info
                    </button>

                    <button
                      type="button"
                      className="danger-outline-button"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default AdminUsers;
