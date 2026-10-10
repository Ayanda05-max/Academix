import { useEffect, useState } from "react";
import SubmissionFiles from "../../components/SubmissionFiles";
import type { SubmissionFileInfo } from "../../utils/submissionFiles";

type Course = {
  id: number;
  title: string;
  instructorId: number | null;
};

type Assignment = {
  id: number;
  courseId: number;
  title: string;
  totalMarks: number;
};

type Submission = {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  fileUrl: string | null;
  submittedAt: string;
  status: string;
  files: SubmissionFileInfo[];
};

type Grade = {
  id: number;
  submissionId: number;
  totalMarks: number;
  marksAwarded: number;
  feedback: string;
  gradedAt: string;
};

function LecturerSubmissions() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Record<number, Assignment[]>>(
    {}
  );
  const [submissions, setSubmissions] = useState<Record<number, Submission[]>>(
    {}
  );
  const [grades, setGrades] = useState<Record<number, Grade>>({});
  const [gradeMarks, setGradeMarks] = useState<Record<number, string>>({});
  const [gradeFeedback, setGradeFeedback] = useState<Record<number, string>>(
    {}
  );
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");
  const lecturerId = Number(localStorage.getItem("userId"));

  const lecturerCourses = courses.filter(
    (course) => course.instructorId === lecturerId
  );

  useEffect(() => {
    loadCourses();
  }, []);

  // Load courses, then everything that belongs to them
  async function loadCourses() {
    if (!token) {
      setError("You must be logged in to view submissions.");
      return;
    }

    try {
      const response = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Course[] = await response.json();

        setCourses(data);
        setError("");

        for (const course of data) {
          if (course.instructorId === lecturerId) {
            await loadAssignments(course.id);
            await loadGrades(course.id);
          }
        }
      } else {
        setError("Could not load courses.");
      }
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  // Load assignments
  async function loadAssignments(courseId: number) {
    try {
      const response = await fetch(`/api/assignments/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Assignment[] = await response.json();

        setAssignments((current) => ({
          ...current,
          [courseId]: data,
        }));

        for (const assignment of data) {
          await loadSubmissions(assignment.id);
        }
      }
    } catch (error) {
      console.error("Could not load assignments:", error);
    }
  }

  // Load submissions
  async function loadSubmissions(assignmentId: number) {
    try {
      const response = await fetch(
        `/api/assignments/${assignmentId}/submissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data: Submission[] = await response.json();

        setSubmissions((current) => ({
          ...current,
          [assignmentId]: data,
        }));
      }
    } catch (error) {
      console.error("Could not load submissions:", error);
    }
  }

  // Load saved grades
  async function loadGrades(courseId: number) {
    try {
      const response = await fetch(`/api/grades/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Grade[] = await response.json();

        setGrades((current) => {
          const updated = { ...current };

          for (const grade of data) {
            updated[grade.submissionId] = grade;
          }

          return updated;
        });
      }
    } catch (error) {
      console.error("Could not load grades:", error);
    }
  }

  // Grade submission
  async function gradeSubmission(
    submissionId: number,
    assignmentId: number,
    courseId: number,
    totalMarks: number
  ) {
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    const marksText = gradeMarks[submissionId];

    if (marksText === undefined || marksText === "") {
      alert("Please enter marks.");
      return;
    }

    const marks = Number(marksText);

    if (Number.isNaN(marks) || marks < 0 || marks > totalMarks) {
      alert(`Marks must be between 0 and ${totalMarks}.`);
      return;
    }

    try {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submissionId,
          marksAwarded: marks,
          feedback: gradeFeedback[submissionId] || "",
        }),
      });

      if (response.ok) {
        alert("Submission graded successfully");

        await loadSubmissions(assignmentId);
        await loadGrades(courseId);

        setGradeMarks((current) => ({
          ...current,
          [submissionId]: "",
        }));

        setGradeFeedback((current) => ({
          ...current,
          [submissionId]: "",
        }));
      } else {
        const message = await response.text();

        alert("Could not grade submission: " + message);
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Copy submission information
  async function copySubmissionInfo(
    submission: Submission,
    assignment: Assignment
  ) {
    const savedGrade = grades[submission.id];

    const submissionInfo = [
      `Student: ${submission.studentName}`,
      `Assignment: ${assignment.title}`,
      `Files: ${
        submission.files?.length
          ? submission.files.map((file) => file.name).join(", ")
          : "None"
      }`,
      `Link: ${submission.fileUrl || "None"}`,
      `Status: ${submission.status}`,
      savedGrade
        ? `Grade: ${savedGrade.marksAwarded}/${savedGrade.totalMarks}`
        : "Grade: Not graded yet",
      savedGrade?.feedback
        ? `Feedback: ${savedGrade.feedback}`
        : "Feedback: No feedback yet",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(submissionInfo);
      alert("Submission information copied.");
    } catch (error) {
      alert("Could not copy submission information.");
      console.error(error);
    }
  }

  return (
    <>
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">LECTURER PORTAL</p>

          <h1>Submissions</h1>

          <p className="dashboard-description">
            Review submitted work and record student grades.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* STUDENT SUBMISSIONS */}

      <section className="submissions-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">ASSESSMENT MANAGEMENT</p>
            <h2>Student Submissions</h2>
            <p>Review submitted work and record student grades.</p>
          </div>
        </div>

        {lecturerCourses.length === 0 ? (
          <div className="dashboard-empty">
            <p>No lecturer courses available.</p>
          </div>
        ) : (
          lecturerCourses.map((course) => (
            <div className="submission-course" key={course.id}>
              <div className="submission-course-header">
                <h3>{course.title}</h3>

                <span>{assignments[course.id]?.length || 0} assignment(s)</span>
              </div>

              {!assignments[course.id] || assignments[course.id].length === 0 ? (
                <p className="muted-text">No assignments for this course.</p>
              ) : (
                assignments[course.id].map((assignment) => (
                  <div className="submission-assignment" key={assignment.id}>
                    <div className="submission-assignment-header">
                      <div>
                        <h4>{assignment.title}</h4>

                        <p>{assignment.totalMarks} total marks</p>
                      </div>
                    </div>

                    {!submissions[assignment.id] ||
                    submissions[assignment.id].length === 0 ? (
                      <div className="dashboard-empty compact-empty">
                        <p>No submissions yet.</p>
                      </div>
                    ) : (
                      submissions[assignment.id].map((submission) => {
                        const savedGrade = grades[submission.id];

                        return (
                          <article
                            className="submission-card"
                            key={submission.id}
                          >
                            <div className="submission-card-header">
                              <div>
                                <h4>{submission.studentName}</h4>

                                <p>
                                  Submitted{" "}
                                  {new Date(
                                    submission.submittedAt
                                  ).toLocaleString()}
                                </p>
                              </div>

                              <span
                                className={`status-badge ${
                                  submission.status === "GRADED"
                                    ? "status-graded"
                                    : "status-submitted"
                                }`}
                              >
                                {submission.status}
                              </span>
                            </div>

                            <div className="submission-copy-row">
                              <button
                                type="button"
                                className="copy-outline-button"
                                onClick={() =>
                                  copySubmissionInfo(submission, assignment)
                                }
                              >
                                Copy Submission Info
                              </button>
                            </div>

                            <div className="submission-file">
                              <span>Submitted work</span>

                              <SubmissionFiles
                                files={submission.files}
                                fileUrl={submission.fileUrl}
                              />
                            </div>

                            {savedGrade ? (
                              <div className="grade-result">
                                <div className="grade-result-header">
                                  <h5>Grade Result</h5>

                                  <strong>
                                    {savedGrade.marksAwarded} /{" "}
                                    {savedGrade.totalMarks}
                                  </strong>
                                </div>

                                <p>
                                  <strong>Feedback:</strong>{" "}
                                  {savedGrade.feedback ||
                                    "No feedback provided."}
                                </p>

                                <p className="grade-date">
                                  Graded{" "}
                                  {new Date(
                                    savedGrade.gradedAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                            ) : submission.status !== "GRADED" ? (
                              <div className="grading-section">
                                <h5>Grade Submission</h5>

                                <div className="grading-fields">
                                  <div className="dashboard-form-field">
                                    <label>Marks</label>

                                    <input
                                      type="number"
                                      min="0"
                                      max={assignment.totalMarks}
                                      placeholder={`Marks out of ${assignment.totalMarks}`}
                                      value={gradeMarks[submission.id] || ""}
                                      onChange={(event) =>
                                        setGradeMarks((current) => ({
                                          ...current,
                                          [submission.id]: event.target.value,
                                        }))
                                      }
                                    />
                                  </div>

                                  <div className="dashboard-form-field">
                                    <label>Feedback</label>

                                    <input
                                      type="text"
                                      placeholder="Feedback for student"
                                      value={gradeFeedback[submission.id] || ""}
                                      onChange={(event) =>
                                        setGradeFeedback((current) => ({
                                          ...current,
                                          [submission.id]: event.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    gradeSubmission(
                                      submission.id,
                                      assignment.id,
                                      course.id,
                                      assignment.totalMarks
                                    )
                                  }
                                >
                                  Save Grade
                                </button>
                              </div>
                            ) : (
                              <p className="muted-text">
                                Grade information is loading.
                              </p>
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </section>
    </>
  );
}

export default LecturerSubmissions;
