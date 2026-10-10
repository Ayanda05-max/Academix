import { useEffect, useState } from "react";
import { readError } from "../../utils/readError";

type Course = {
  id: number;
  title: string;
  instructorId: number | null;
};

type StudentPerformance = {
  studentId: number;
  studentName: string;
  studentEmail: string;
  assignmentPercent: number | null;
  quizPercent: number | null;
  overallPercent: number | null;
  progressPercent: number;
  completedItems: number;
  totalItems: number;
};

function average(values: (number | null)[]) {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) return null;

  const sum = present.reduce((total, value) => total + value, 0);
  return Math.round((sum / present.length) * 10) / 10;
}

function showPercent(value: number | null) {
  return value === null ? "-" : `${value}%`;
}

function LecturerPerformance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");

  const lecturerId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseId) {
      loadStudents(courseId);
    } else {
      setStudents([]);
    }
  }, [courseId]);

  async function loadCourses() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must log in first.");
      setLoadingCourses(false);
      return;
    }

    try {
      const response = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Course[] = await response.json();
        const mine = data.filter((course) => course.instructorId === lecturerId);
        setCourses(mine);
        if (mine.length > 0) setCourseId(String(mine[0].id));
      } else {
        setError("Could not load your courses.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the server.");
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadStudents(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingStudents(true);
    setError("");

    try {
      const response = await fetch(`/api/performance/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: StudentPerformance[] = await response.json();
        setStudents(data);
      } else {
        setStudents([]);
        setError((await readError(response)) || "Could not load performance.");
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
      setError("Could not connect to the server.");
    } finally {
      setLoadingStudents(false);
    }
  }

  const needAttention = students.filter(
    (student) => student.overallPercent !== null && student.overallPercent < 50
  ).length;

  return (
    <>
      <style>{css}</style>

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">LECTURER PORTAL</p>
          <h1>Student Performance</h1>
          <p className="dashboard-description">
            Course grades are 50% assignments and 50% quizzes, based on marked
            work.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {loadingCourses ? (
        <p className="muted-text">Loading your courses...</p>
      ) : courses.length === 0 ? (
        <div className="dashboard-empty">
          <p>You have no courses yet.</p>
        </div>
      ) : (
        <section className="assignments-section">
          <div className="dashboard-form-field">
            <label htmlFor="performance-course">Course</label>

            <select
              id="performance-course"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {loadingStudents ? (
            <p className="muted-text">Loading performance...</p>
          ) : students.length === 0 ? (
            <div className="dashboard-empty">
              <p>No students are enrolled in this course yet.</p>
            </div>
          ) : (
            <>
              <p className="muted-text">
                {students.length} {students.length === 1 ? "student" : "students"}
                {needAttention > 0 &&
                  ` · ${needAttention} below 50% overall`}
              </p>

              <div className="lp-wrap">
                <table className="lp-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Assignments</th>
                      <th>Quizzes</th>
                      <th>Overall</th>
                      <th>Progress</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr key={student.studentId}>
                        <td>
                          <strong>{student.studentName}</strong>
                          <span className="lp-sub">{student.studentEmail}</span>
                        </td>
                        <td>{showPercent(student.assignmentPercent)}</td>
                        <td>{showPercent(student.quizPercent)}</td>
                        <td>
                          {student.overallPercent === null ? (
                            "-"
                          ) : (
                            <span
                              className={`status-badge ${
                                student.overallPercent >= 50
                                  ? "status-published"
                                  : "status-draft"
                              }`}
                            >
                              {student.overallPercent}%
                            </span>
                          )}
                        </td>
                        <td>
                          {student.progressPercent}%
                          <span className="lp-sub">
                            {student.completedItems} of {student.totalItems} done
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td>Class average</td>
                      <td>
                        {showPercent(average(students.map((s) => s.assignmentPercent)))}
                      </td>
                      <td>
                        {showPercent(average(students.map((s) => s.quizPercent)))}
                      </td>
                      <td>
                        {showPercent(average(students.map((s) => s.overallPercent)))}
                      </td>
                      <td>
                        {showPercent(average(students.map((s) => s.progressPercent)))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}

const css = `
.lp-wrap { overflow-x: auto; margin-top: 12px; }
.lp-table { width: 100%; border-collapse: collapse; min-width: 560px; }
.lp-table th, .lp-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e4e9ed; vertical-align: top; }
.lp-table th { font-size: 0.8rem; color: #566573; font-weight: 600; }
.lp-table tfoot td { font-weight: 700; color: #1E3A5F; border-top: 2px solid #d9dee3; border-bottom: none; }
.lp-sub { display: block; font-size: 0.8rem; color: #566573; font-weight: 400; }
`;

export default LecturerPerformance;