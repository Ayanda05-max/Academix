import { useEffect, useState } from "react";
import {
  formatDate,
  getMyNotifications,
  isRead,
  markNotificationRead,
} from "../../services/studentService";
import type { NotificationItem } from "../../types/student";

function StudentNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyNotifications()
      .then(setItems)
      .catch(() => setError("Could not load your notifications."))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id: number) {
    try {
      const updated = await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated, read: true } : n)));
    } catch {
      setError("Could not mark that notification as read.");
    }
  }

  if (loading) return <p className="st-sub">Loading...</p>;

  return (
    <>
      <h1 className="st-title">Notifications</h1>
      <p className="st-sub">Enrolments, new assignments, deadlines and released grades.</p>

      {error && <div className="st-error">{error}</div>}
      {!error && items.length === 0 && <div className="st-empty">No notifications yet.</div>}

      {items.length > 0 && (
        <div className="st-card">
          {items.map((n) => (
            <div className={`st-row ${isRead(n) ? "" : "st-unread"}`} key={n.id}>
              <div>
                <div style={{ fontWeight: isRead(n) ? 400 : 600 }}>{n.message}</div>
                <div className="st-meta">
                  <span className="st-badge neutral">{n.type.replace("_", " ")}</span>{" "}
                  {formatDate(n.createdAt)}
                </div>
              </div>
              {!isRead(n) && (
                <button type="button" className="st-link-btn" onClick={() => handleMarkRead(n.id)}>
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default StudentNotifications;