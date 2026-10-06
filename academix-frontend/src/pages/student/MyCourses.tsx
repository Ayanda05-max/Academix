import { useEffect, useState } from "react";
import { formatDate, getMyEnrollments } from "../../services/studentService";
import type { EnrollmentItem } from "../../types/student";

function MyCourses() {
  const [items, setItems] = useState<EnrollmentItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments()
      .then(setItems)
      .catch(() => setError("Could not load your courses."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="st-sub">Loading...</p>;

  return (
    <>
      <h1 className="st-title">My Courses</h1>
      <p className="st-sub">Courses you are enrolled in.</p>

      {error && <div className="st-error">{error}</div>}
      {!error && items.length === 0 && (
        <div className="st-empty">You are not enrolled in any courses yet. Ask an administrator or lecturer to enrol you.</div>
      )}

      <div className="st-grid">
        {items.map((e) => (
          <div className="st-card" key={e.id}>
            <h2 className="st-course-title">{e.courseTitle}</h2>
            <p className="st-meta">Enrolled {formatDate(e.enrolledAt)}</p>
            <span className={`st-badge ${e.status === "ACTIVE" ? "good" : "neutral"}`}>
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default MyCourses;