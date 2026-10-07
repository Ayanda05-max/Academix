import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { readError } from "../../utils/readError";

type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  status: string;
};

type Assignment = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  courseTitle: string;
};

type Submission = {
  id: number;
  assignmentId: number;
  fileUrl: string;
  submittedAt: string;
  status: string;
};

type Grade = {
  id: number;
  assignmentId: number;
  totalMarks: number;
  marksAwarded: number;
  feedback: string | null;
  gradedAt: string;
};

function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [links, setLinks] = useState<Record<number, string>>({});
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");
  const studentId = Number(localStorage.getItem("userId"));

  // Find the student's submission or grade for one assignment
  function findSubmission(assignmentId: number) {
    return submissions.find(
      (submission) => submission.assignmentId === assignmentId
    );
  }

  function findGrade(assignmentId: number) {
    return grades.find((grade) => grade.assignmentId === assignmentId);
  }

  function isGraded(assignmentId: number) {
    return (
      Boolean(findGrade(assignmentId)) ||
      findSubmission(assignmentId)?.status === "GRADED"
    );
  }

  // Three groups: still to do, waiting for a grade, graded
  const todo = assignments
    .filter((assignment) => !findSubmission(assignment.id))
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  const submitted = assignments.filter(
    (assignment) =>
      findSubmission(assignment.id) && !isGraded(assignment.id)
  );

  const graded = assignments.filter((assignment) =>
    isGraded(assignment.id)
  );

  useEffect(() => {
    loadPage();
  }, []);

  // Load everything the page needs
  async function loadPage() {
    if (!token) {
      setError("You must be logged in to view your assignments.");
      return;
    }

    try {
      const enrolled = await loadEnrollments();
      await loadAssignments(enrolled);
      await loadSubmissions();
      await loadGrades();
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  // Load enrollments
  async function loadEnrollments() {
    const response = await fetch(`/api/enrollments/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setError("Could not load your courses.");
      return [];
    }

    const data: Enrollment[] = await response.json();
    return data;
  }

  // Load the assignments of every active course
  async function loadAssignments(enrolled: Enrollment[]) {
    const all: Assignment[] = [];

    for (const enrollment of enrolled) {
      if (enrollment.status !== "ACTIVE") {
        continue;
      }

      const response = await fetch(
        `/api/assignments/course/${enrollment.courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data: Assignment[] = await response.json();

        for (const assignment of data) {
          all.push({
            ...assignment,
            courseTitle: enrollment.courseTitle,
          });
        }
      }
    }

    setAssignments(all);
  }

  // Load the student's own submissions
  async function loadSubmissions() {
    const response = await fetch("/api/submissions/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data: Submission[] = await response.json();
      setSubmissions(data);
    }
  }

  // Load the student's grades
  async function loadGrades() {
    const response = await fetch(`/api/grades/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data: Grade[] = await response.json();
      setGrades(data);
    }
  }

  // Submit an assignment (the backend takes a link to the work)
  async function submitAssignment(
    event: FormEvent<HTMLFormElement>,
    assignment: Assignment
  ) {
    event.preventDefault();

    if (!token) {
      alert("You must be logged in.");
      return;
    }

    const fileUrl = (links[assignment.id] || "").trim();

    if (!fileUrl) {
      alert("Please enter the link to your work.");
      return;
    }

    if (new Date(assignment.dueDate) < new Date()) {
      const confirmed = window.confirm(
        "This assignment is overdue and will be marked LATE. Submit anyway?"
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      const response = await fetch(
        `/api/assignments/${assignment.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fileUrl }),
        }
      );

      if (response.ok) {
        setLinks((current) => ({
          ...current,
          [assignment.id]: "",
        }));

        alert("Assignment submitted successfully");

        await loadSubmissions();
      } else if (response.status === 409) {
        alert("You have already submitted this assignment.");

        await loadSubmissions();
      } else {
        const message = await readError(response);

        alert("Could not submit assignment: " + message);
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Text like "Due in 3 days"
  function dueText(dueDate: string) {
    const difference = new Date(dueDate).getTime() - Date.now();

    if (difference < 0) {
      return "Overdue";
    }

    const hours = Math.floor(difference / 3600000);

    if (hours < 1) {
      return "Due in under an hour";
    }

    if (hours < 48) {
      return `Due in ${hours} hours`;
    }

    return `Due in ${Math.floor(hours / 24)} days`;
  }

  return (
    <>
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">STUDENT PORTAL</p>

          <h1>Assignments</h1>

          <p className="dashboard-description">
            Submit your work, follow your deadlines and see your results.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* TO DO */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">TO DO</p>
            <h2>Not Submitted Yet</h2>
            <p>Paste a link to your work (for example a Drive link).</p>
          </div>

          <span className="section-count">{todo.length}</span>
        </div>

        {todo.length === 0 ? (
          <div className="dashboard-empty">
            <p>Nothing to hand in right now.</p>
          </div>
        ) : (
          <div className="compact-list">
            {todo.map((assignment) => (
              <div className="assignment-summary" key={assignment.id}>
                <div className="assignment-summary-header">
                  <strong>{assignment.title}</strong>

                  <span
                    className={`st-badge ${
                      dueText(assignment.dueDate) === "Overdue"
                        ? "bad"
                        : "neutral"
                    }`}
                  >
                    {dueText(assignment.dueDate)}
                  </span>
                </div>

                <p>
                  {assignment.courseTitle} &middot; {assignment.totalMarks}{" "}
                  marks
                </p>

                <p>{assignment.description}</p>

                <small>
                  Due {new Date(assignment.dueDate).toLocaleString()}
                </small>

                <form
                  onSubmit={(event) => submitAssignment(event, assignment)}
                >
                  <div className="dashboard-form-field dashboard-form-wide">
                    <label>Link to your work</label>

                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={links[assignment.id] || ""}
                      onChange={(event) =>
                        setLinks((current) => ({
                          ...current,
                          [assignment.id]: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="dashboard-form-actions">
                    <button type="submit">Submit Assignment</button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SUBMITTED */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">WAITING</p>
            <h2>Submitted</h2>
            <p>Handed in and waiting for your lecturer to grade.</p>
          </div>

          <span className="section-count">{submitted.length}</span>
        </div>

        {submitted.length === 0 ? (
          <div className="dashboard-empty">
            <p>No submissions waiting for a grade.</p>
          </div>
        ) : (
          <div className="compact-list">
            {submitted.map((assignment) => {
              const submission = findSubmission(assignment.id);

              return (
                <div className="assignment-summary" key={assignment.id}>
                  <div className="assignment-summary-header">
                    <strong>{assignment.title}</strong>

                    <span
                      className={`st-badge ${
                        submission?.status === "LATE" ? "bad" : "good"
                      }`}
                    >
                      {submission?.status === "LATE"
                        ? "Submitted late"
                        : "Submitted"}
                    </span>
                  </div>

                  <p>
                    {assignment.courseTitle} &middot; {assignment.totalMarks}{" "}
                    marks
                  </p>

                  {submission && (
                    <>
                      <small>
                        Submitted{" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </small>

                      <p>
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open your submission
                        </a>
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* GRADED */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">RESULTS</p>
            <h2>Graded</h2>
            <p>A pass is 50% or more.</p>
          </div>

          <span className="section-count">{graded.length}</span>
        </div>

        {graded.length === 0 ? (
          <div className="dashboard-empty">
            <p>No graded assignments yet.</p>
          </div>
        ) : (
          <div className="compact-list">
            {graded.map((assignment) => {
              const grade = findGrade(assignment.id);

              const percentage =
                grade && grade.totalMarks > 0
                  ? Math.round((grade.marksAwarded / grade.totalMarks) * 100)
                  : 0;

              return (
                <div className="assignment-summary" key={assignment.id}>
                  <div className="assignment-summary-header">
                    <strong>{assignment.title}</strong>

                    {grade && (
                      <span
                        className={`st-badge ${
                          percentage >= 50 ? "good" : "bad"
                        }`}
                      >
                        {percentage}%
                      </span>
                    )}
                  </div>

                  <p>
                    {assignment.courseTitle} &middot; {assignment.totalMarks}{" "}
                    marks
                  </p>

                  {grade ? (
                    <>
                      <p>
                        <strong>
                          {grade.marksAwarded} / {grade.totalMarks}
                        </strong>
                      </p>

                      <p>Feedback: {grade.feedback || "No feedback"}</p>

                      <small>
                        Graded {new Date(grade.gradedAt).toLocaleDateString()}
                      </small>
                    </>
                  ) : (
                    <p>Your grade is loading.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default StudentAssignments;
