import { useEffect, useState } from "react";
import { formatDate, getMyGrades } from "../../services/studentService";
import type { GradeItem } from "../../types/student";

function StudentGrades() {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyGrades()
      .then(setGrades)
      .catch(() => setError("Could not load your grades."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="st-sub">Loading...</p>;

  return (
    <>
      <h1 className="st-title">Grades</h1>
      <p className="st-sub">Marks and feedback released by your lecturers.</p>

      {error && <div className="st-error">{error}</div>}
      {!error && grades.length === 0 && <div className="st-empty">No grades have been released yet.</div>}

      {grades.length > 0 && (
        <table className="st-table">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Course</th>
              <th>Marks</th>
              <th>Result</th>
              <th>Feedback</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => {
              const pct = g.totalMarks > 0 ? Math.round((g.marksAwarded / g.totalMarks) * 100) : 0;
              return (
                <tr key={g.id}>
                  <td>{g.assignmentTitle}</td>
                  <td>#{g.courseId}</td>
                  <td>{g.marksAwarded}/{g.totalMarks}</td>
                  <td>
                    <span className={`st-badge ${pct >= 50 ? "good" : "bad"}`}>{pct}%</span>
                  </td>
                  <td>{g.feedback || "-"}</td>
                  <td>{formatDate(g.gradedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

export default StudentGrades;