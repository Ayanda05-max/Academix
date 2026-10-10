import { useEffect, useState } from "react";
import { readError } from "../../utils/readError";

type AssignmentItem = {
  assignmentId: number;
  title: string;
  status: string;
  marksAwarded: number | null;
  totalMarks: number;
  feedback: string | null;
  gradedAt: string | null;
};

type QuizItem = {
  quizId: number;
  title: string;
  status: string;
  score: number | null;
  totalMarks: number;
};

type CoursePerformance = {
  courseId: number;
  courseTitle: string;
  assignmentPercent: number | null;
  quizPercent: number | null;
  overallPercent: number | null;
  progressPercent: number;
  completedItems: number;
  totalItems: number;
  assignments: AssignmentItem[];
  quizzes: QuizItem[];
};

function formatDate(date: string | null) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function showPercent(value: number | null) {
  return value === null ? "-" : `${value}%`;
}

function badgeClass(value: number | null) {
  if (value === null) return "st-badge";
  return `st-badge ${value >= 50 ? "good" : "bad"}`;
}

function StudentGrades() {
  const [courses, setCourses] = useState<CoursePerformance[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
  }, []);

  async function loadPerformance() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must log in first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/performance/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: CoursePerformance[] = await response.json();
        setCourses(data);
      } else {
        setError((await readError(response)) || "Could not load your grades.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="st-sub">Loading...</p>;

  return (
    <>
      <style>{css}</style>

      <h1 className="st-title">Grades</h1>
      <p className="st-sub">
        Your course grade is 50% assignments and 50% quizzes, based on the work
        that has been marked so far.
      </p>

      {error && <div className="st-error">{error}</div>}
      {!error && courses.length === 0 && (
        <div className="st-empty">You are not enrolled in any courses yet.</div>
      )}

      {courses.map((course) => (
        <section className="pf-course" key={course.courseId}>
          <div className="pf-head">
            <h2>{course.courseTitle}</h2>
            <span className={badgeClass(course.overallPercent)}>
              {course.overallPercent === null
                ? "No grade yet"
                : `${course.overallPercent}% overall`}
            </span>
          </div>

          <div className="pf-tiles">
            <div className="pf-tile">
              <span>Assignments</span>
              <strong>{showPercent(course.assignmentPercent)}</strong>
            </div>

            <div className="pf-tile">
              <span>Quizzes</span>
              <strong>{showPercent(course.quizPercent)}</strong>
            </div>

            <div className="pf-tile">
              <span>Progress</span>
              <strong>{course.progressPercent}%</strong>
            </div>
          </div>

          <div className="pf-progress" aria-hidden="true">
            <div style={{ width: `${course.progressPercent}%` }} />
          </div>
          <p className="pf-note">
            {course.completedItems} of {course.totalItems} assessments completed
          </p>

          <h3>Assignments</h3>
          {course.assignments.length === 0 ? (
            <p className="pf-note">No assignments in this course yet.</p>
          ) : (
            <table className="st-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Status</th>
                  <th>Marks</th>
                  <th>Feedback</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {course.assignments.map((item) => (
                  <tr key={item.assignmentId}>
                    <td>{item.title}</td>
                    <td>
                      {item.status === "GRADED"
                        ? "Graded"
                        : item.status === "SUBMITTED"
                        ? "Awaiting grading"
                        : "Not submitted"}
                    </td>
                    <td>
                      {item.marksAwarded === null
                        ? "-"
                        : `${item.marksAwarded}/${item.totalMarks}`}
                    </td>
                    <td>{item.feedback || "-"}</td>
                    <td>{formatDate(item.gradedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3>Quizzes</h3>
          {course.quizzes.length === 0 ? (
            <p className="pf-note">No quizzes in this course yet.</p>
          ) : (
            <table className="st-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Status</th>
                  <th>Marks</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {course.quizzes.map((item) => {
                  const taken = item.status === "TAKEN" && item.score !== null;
                  const pct =
                    taken && item.totalMarks > 0
                      ? Math.round(((item.score as number) / item.totalMarks) * 100)
                      : null;

                  return (
                    <tr key={item.quizId}>
                      <td>{item.title}</td>
                      <td>{taken ? "Completed" : "Not taken yet"}</td>
                      <td>{taken ? `${item.score}/${item.totalMarks}` : "-"}</td>
                      <td>
                        {pct === null ? (
                          "-"
                        ) : (
                          <span className={badgeClass(pct)}>{pct}%</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </>
  );
}

const css = `
.pf-course { background: #fff; border: 1px solid #d9dee3; border-radius: 10px; padding: 16px; margin: 16px 0; }
.pf-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pf-head h2 { margin: 0; color: #1E3A5F; font-size: 1.2rem; }
.pf-course h3 { margin: 18px 0 8px; color: #2C3E50; font-size: 1rem; }
.pf-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 14px 0 10px; }
.pf-tile { border: 1px solid #d9dee3; border-radius: 8px; padding: 10px 12px; background: #F8FAFB; display: flex; flex-direction: column; gap: 2px; }
.pf-tile span { font-size: 0.8rem; color: #566573; }
.pf-tile strong { font-size: 1.3rem; color: #1E3A5F; }
.pf-progress { height: 8px; background: #E4E9ED; border-radius: 999px; overflow: hidden; }
.pf-progress div { height: 100%; background: #2E86AB; }
.pf-note { color: #566573; font-size: 0.85rem; margin: 6px 0; }
@media (max-width: 520px) { .pf-tiles { grid-template-columns: 1fr; } }
`;

export default StudentGrades;