import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, Inbox, Clock } from "lucide-react";
import "../dashboardPanels.css";

type Course = {
  id: number;
  title: string;
  category: string | null;
  status: string;
  instructorId: number | null;
};

type Assignment = {
  id: number;
  courseId: number;
  title: string;
  dueDate: string;
  totalMarks: number;
};

type Submission = {
  id: number;
  assignmentId: number;
  studentName: string;
  submittedAt: string;
  status: string;
};

type Enrollment = {
  id: number;
  status: string;
};

type Grade = {
  id: number;
  totalMarks: number;
  marksAwarded: number;
};

// Mark bands used by the grade distribution chart
const BANDS = [
  { label: "0-49%", min: 0, max: 49, fail: true },
  { label: "50-59%", min: 50, max: 59, fail: false },
  { label: "60-69%", min: 60, max: 69, fail: false },
  { label: "70-79%", min: 70, max: 79, fail: false },
  { label: "80-100%", min: 80, max: 100, fail: false },
];

function percentOf(grade: Grade) {
  if (grade.totalMarks <= 0) {
    return 0;
  }

  return Math.round((grade.marksAwarded / grade.totalMarks) * 100);
}

// Text like "Waiting 3 days"
function waitingText(submittedAt: string) {
  const hours = Math.floor(
    (Date.now() - new Date(submittedAt).getTime()) / 3600000
  );

  if (hours < 1) {
    return "Submitted just now";
  }

  if (hours < 24) {
    return `Waiting ${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  const days = Math.floor(hours / 24);

  return `Waiting ${days} ${days === 1 ? "day" : "days"}`;
}

// Text like "Due in 3 days"
function dueText(dueDate: string) {
  const hours = Math.floor(
    (new Date(dueDate).getTime() - Date.now()) / 3600000
  );

  if (hours < 1) {
    return "Due in under an hour";
  }

  if (hours < 24) {
    return `Due in ${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  const days = Math.floor(hours / 24);

  return `Due in ${days} ${days === 1 ? "day" : "days"}`;
}

function LecturerHome() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enrolled, setEnrolled] = useState<Record<number, number>>({});
  const [grades, setGrades] = useState<Record<number, Grade[]>>({});
  const [chartCourseId, setChartCourseId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");
  const lecturerId = Number(localStorage.getItem("userId"));

  // Submissions that are not graded yet, the ones waiting longest first
  const pendingSubmissions = submissions
    .filter((submission) => submission.status !== "GRADED")
    .sort(
      (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );

  // Assignments that are still open, the next deadline first
  const upcoming = assignments
    .filter((assignment) => new Date(assignment.dueDate).getTime() > Date.now())
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  const chartGrades = chartCourseId ? grades[chartCourseId] || [] : [];
  const bandCounts = BANDS.map(
    (band) =>
      chartGrades.filter((grade) => {
        const percent = percentOf(grade);
        return percent >= band.min && percent <= band.max;
      }).length
  );
  const biggestBand = Math.max(1, ...bandCounts);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function getJson<T>(url: string): Promise<T | null> {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  // Load everything the dashboard needs
  async function loadDashboard() {
    if (!token) {
      setError("You must be logged in to view your dashboard.");
      return;
    }

    try {
      const data = await getJson<Course[]>("/api/courses");

      if (!data) {
        setError("Could not load courses.");
        return;
      }

      const myCourses = data.filter(
        (course) => course.instructorId === lecturerId
      );

      const allAssignments: Assignment[] = [];
      const allSubmissions: Submission[] = [];
      const enrolledCounts: Record<number, number> = {};
      const gradesByCourse: Record<number, Grade[]> = {};

      for (const course of myCourses) {
        const [courseAssignments, enrollments, courseGrades] =
          await Promise.all([
            getJson<Assignment[]>(`/api/assignments/course/${course.id}`),
            getJson<Enrollment[]>(`/api/enrollments/course/${course.id}`),
            getJson<Grade[]>(`/api/grades/course/${course.id}`),
          ]);

        enrolledCounts[course.id] = (enrollments || []).filter(
          (enrollment) => enrollment.status === "ACTIVE"
        ).length;

        gradesByCourse[course.id] = courseGrades || [];

        for (const assignment of courseAssignments || []) {
          allAssignments.push(assignment);

          const assignmentSubmissions = await getJson<Submission[]>(
            `/api/assignments/${assignment.id}/submissions`
          );

          allSubmissions.push(...(assignmentSubmissions || []));
        }
      }

      setCourses(myCourses);
      setAssignments(allAssignments);
      setSubmissions(allSubmissions);
      setEnrolled(enrolledCounts);
      setGrades(gradesByCourse);

      if (myCourses.length > 0) {
        setChartCourseId(myCourses[0].id);
      }

      setLoaded(true);
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  function findAssignment(assignmentId: number) {
    return assignments.find((assignment) => assignment.id === assignmentId);
  }

  function courseTitle(courseId: number) {
    return courses.find((course) => course.id === courseId)?.title || "";
  }

  function averageGrade(courseId: number) {
    const list = grades[courseId] || [];

    if (list.length === 0) {
      return null;
    }

    const total = list.reduce((sum, grade) => sum + percentOf(grade), 0);

    return Math.round(total / list.length);
  }

  return (
    <>
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">LECTURER PORTAL</p>

          <h1>Lecturer Dashboard</h1>

          <p className="dashboard-description">
            Manage your courses, learning content, assignments and student
            submissions.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* OVERVIEW */}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">MY COURSES</p>
            <span className="stat-icon">
              <BookOpen size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{courses.length}</div>
          <p>Courses assigned to you</p>
        </div>

        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">ASSIGNMENTS</p>
            <span className="stat-icon">
              <ClipboardList size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{assignments.length}</div>
          <p>Across your courses</p>
        </div>

        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">SUBMISSIONS</p>
            <span className="stat-icon">
              <Inbox size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{submissions.length}</div>
          <p>Received from students</p>
        </div>

        <div
          className={`dashboard-card ${
            pendingSubmissions.length > 0 ? "stat-warning" : ""
          }`}
        >
          <div className="stat-card-top">
            <p className="dashboard-card-label">PENDING GRADING</p>
            <span className="stat-icon">
              <Clock size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">
            {pendingSubmissions.length}
          </div>
          <p>Waiting for grading</p>
        </div>
      </div>

      {/* GRADING AND DEADLINES */}

      <div className="home-grid">
        <section className="home-panel">
          <div className="home-panel-header">
            <h2>Needs grading</h2>

            <Link to="/lecturer/submissions" className="home-link">
              All submissions
            </Link>
          </div>

          {!loaded ? (
            <p className="home-empty">Loading...</p>
          ) : pendingSubmissions.length === 0 ? (
            <p className="home-empty">No submissions are waiting for grading.</p>
          ) : (
            <ul className="home-list">
              {pendingSubmissions.slice(0, 5).map((submission) => {
                const assignment = findAssignment(submission.assignmentId);

                return (
                  <li className="home-list-item" key={submission.id}>
                    <div className="home-list-main">
                      <strong>{submission.studentName}</strong>
                      <span>
                        {assignment?.title || "Assignment"} &middot;{" "}
                        {waitingText(submission.submittedAt)}
                      </span>
                    </div>

                    <div className="home-list-side">
                      {submission.status === "LATE" && (
                        <span className="status-badge status-late">LATE</span>
                      )}

                      <Link to="/lecturer/submissions" className="home-link">
                        Grade
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {pendingSubmissions.length > 5 && (
            <p className="home-more">
              and {pendingSubmissions.length - 5} more waiting
            </p>
          )}
        </section>

        <section className="home-panel">
          <div className="home-panel-header">
            <h2>Upcoming deadlines</h2>

            <Link to="/lecturer/assignments" className="home-link">
              Assignments
            </Link>
          </div>

          {!loaded ? (
            <p className="home-empty">Loading...</p>
          ) : upcoming.length === 0 ? (
            <p className="home-empty">No assignments are due soon.</p>
          ) : (
            <ul className="home-list">
              {upcoming.slice(0, 5).map((assignment) => {
                const handedIn = submissions.filter(
                  (submission) => submission.assignmentId === assignment.id
                ).length;

                const students = enrolled[assignment.courseId] || 0;

                const percent =
                  students > 0
                    ? Math.min(100, Math.round((handedIn / students) * 100))
                    : 0;

                return (
                  <li className="home-list-item" key={assignment.id}>
                    <div className="home-list-main home-list-wide">
                      <strong>{assignment.title}</strong>
                      <span>
                        {courseTitle(assignment.courseId)} &middot;{" "}
                        {dueText(assignment.dueDate)}
                      </span>

                      <div className="home-progress">
                        <span style={{ width: `${percent}%` }} />
                      </div>

                      <span>
                        {students > 0
                          ? `${handedIn} of ${students} submitted`
                          : `${handedIn} submitted`}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* COURSES */}

      <section className="home-panel home-block">
        <div className="home-panel-header">
          <h2>Your courses</h2>

          <Link to="/lecturer/courses" className="home-link">
            Manage courses
          </Link>
        </div>

        {!loaded ? (
          <p className="home-empty">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="home-empty">
            You do not have any courses yet. Create one under My Courses.
          </p>
        ) : (
          <div className="home-courses">
            {courses.map((course) => {
              const average = averageGrade(course.id);

              return (
                <div className="home-course" key={course.id}>
                  <div className="home-course-head">
                    <div>
                      <p className="course-category">
                        {course.category || "Uncategorised"}
                      </p>
                      <h3>{course.title}</h3>
                    </div>

                    <span
                      className={`status-badge ${
                        course.status === "PUBLISHED"
                          ? "status-published"
                          : "status-draft"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="home-course-stats">
                    <div>
                      <strong>{enrolled[course.id] || 0}</strong>
                      <span>Students</span>
                    </div>

                    <div>
                      <strong>
                        {
                          assignments.filter(
                            (assignment) => assignment.courseId === course.id
                          ).length
                        }
                      </strong>
                      <span>Assignments</span>
                    </div>

                    <div>
                      <strong>{average === null ? "-" : `${average}%`}</strong>
                      <span>Average</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* GRADE DISTRIBUTION */}

      {courses.length > 0 && (
        <section className="home-panel home-block">
          <div className="home-panel-header">
            <h2>Grade distribution</h2>

            <select
              className="home-select"
              value={chartCourseId ?? ""}
              onChange={(event) => setChartCourseId(Number(event.target.value))}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {chartGrades.length === 0 ? (
            <p className="home-empty">
              No graded work in this course yet. Marks will appear here once
              you grade submissions.
            </p>
          ) : (
            <div>
              {BANDS.map((band, index) => (
                <div className="dist-row" key={band.label}>
                  <span>{band.label}</span>

                  <div className="dist-bar">
                    <span
                      className={band.fail ? "dist-fail" : ""}
                      style={{
                        width: `${(bandCounts[index] / biggestBand) * 100}%`,
                      }}
                    />
                  </div>

                  <span className="dist-count">{bandCounts[index]}</span>
                </div>
              ))}

              <p className="home-note">
                {chartGrades.length} graded{" "}
                {chartGrades.length === 1 ? "submission" : "submissions"}. A
                pass is 50% or more.
              </p>
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default LecturerHome;
