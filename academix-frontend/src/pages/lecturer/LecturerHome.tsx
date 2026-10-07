import { useEffect, useState } from "react";

type Course = {
  id: number;
  title: string;
  instructorId: number | null;
};

type Assignment = {
  id: number;
  courseId: number;
};

type Submission = {
  id: number;
  assignmentId: number;
  status: string;
};

function LecturerHome() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");
  const lecturerId = Number(localStorage.getItem("userId"));

  // Submissions that are not graded yet
  const pendingSubmissions = submissions.filter(
    (submission) => submission.status !== "GRADED"
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  // Load everything the dashboard needs
  async function loadDashboard() {
    if (!token) {
      setError("You must be logged in to view your dashboard.");
      return;
    }

    try {
      const response = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setError("Could not load courses.");
        return;
      }

      const data: Course[] = await response.json();
      const myCourses = data.filter(
        (course) => course.instructorId === lecturerId
      );

      setCourses(myCourses);

      const allAssignments: Assignment[] = [];
      const allSubmissions: Submission[] = [];

      for (const course of myCourses) {
        const assignmentResponse = await fetch(
          `/api/assignments/course/${course.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (assignmentResponse.ok) {
          const courseAssignments: Assignment[] =
            await assignmentResponse.json();

          allAssignments.push(...courseAssignments);

          for (const assignment of courseAssignments) {
            const submissionResponse = await fetch(
              `/api/assignments/${assignment.id}/submissions`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (submissionResponse.ok) {
              const assignmentSubmissions: Submission[] =
                await submissionResponse.json();

              allSubmissions.push(...assignmentSubmissions);
            }
          }
        }
      }

      setAssignments(allAssignments);
      setSubmissions(allSubmissions);
    } catch (error) {
      setError("ERROR: " + String(error));
    }
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
          <p className="dashboard-card-label">MY COURSES</p>
          <div className="dashboard-card-value">{courses.length}</div>
          <p>Courses assigned to you</p>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-card-label">ASSIGNMENTS</p>
          <div className="dashboard-card-value">{assignments.length}</div>
          <p>Across your courses</p>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-card-label">SUBMISSIONS</p>
          <div className="dashboard-card-value">{submissions.length}</div>
          <p>Student submissions received</p>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-card-label">PENDING GRADING</p>
          <div className="dashboard-card-value">
            {pendingSubmissions.length}
          </div>
          <p>Waiting for grading</p>
        </div>
      </div>
    </>
  );
}

export default LecturerHome;
