import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { readError } from "../../utils/readError";

type Course = {
  id: number;
  title: string;
  instructorId: number | null;
};

type Assignment = {
  id: number;
  courseId: number;
  title: string;
  instructionsFileName?: string | null;
};

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function LecturerAssignments() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");

  const [assignmentCourseId, setAssignmentCourseId] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentTotalMarks, setAssignmentTotalMarks] = useState("");
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [assignmentNotice, setAssignmentNotice] = useState<Notice>(null);

  const [instructionsFile, setInstructionsFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const lecturerId = Number(localStorage.getItem("userId"));

  const lecturerCourses = courses.filter(
    (course) => course.instructorId === lecturerId
  );

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to view courses.");
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
      } else {
        setError("Could not load courses.");
      }
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creatingAssignment) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setAssignmentNotice({ type: "error", text: "You must be logged in." });
      return;
    }

    if (!assignmentCourseId) {
      setAssignmentNotice({ type: "error", text: "Please select a course." });
      return;
    }

    if (Number(assignmentTotalMarks) <= 0) {
      setAssignmentNotice({
        type: "error",
        text: "Total marks must be greater than 0.",
      });
      return;
    }

    if (instructionsFile) {
      const isPdf =
        instructionsFile.type === "application/pdf" ||
        instructionsFile.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        setAssignmentNotice({
          type: "error",
          text: "The instructions file must be a PDF.",
        });
        return;
      }

      if (instructionsFile.size > 10 * 1024 * 1024) {
        setAssignmentNotice({
          type: "error",
          text: "The PDF must be 10 MB or smaller.",
        });
        return;
      }
    }

    setCreatingAssignment(true);
    setAssignmentNotice(null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: Number(assignmentCourseId),
          title: assignmentTitle,
          description: assignmentDescription,
          dueDate: assignmentDueDate,
          totalMarks: Number(assignmentTotalMarks),
        }),
      });

      if (response.ok) {
        const newAssignment: Assignment = await response.json();

        // Attach the instructions PDF, if the lecturer chose one
        let uploadError = "";
        if (instructionsFile) {
          const formData = new FormData();
          formData.append("file", instructionsFile);

          const uploadResponse = await fetch(
            `/api/assignments/${newAssignment.id}/instructions`,
            {
              method: "POST",
              signal: controller.signal,
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            uploadError = await readError(uploadResponse);
          }
        }

        setAssignmentCourseId("");
        setAssignmentTitle("");
        setAssignmentDescription("");
        setAssignmentDueDate("");
        setAssignmentTotalMarks("");
        setInstructionsFile(null);
        setFileInputKey((key) => key + 1);

        if (uploadError) {
          setAssignmentNotice({
            type: "error",
            text: `Assignment "${newAssignment.title}" was created, but the PDF was not attached: ${uploadError}`,
          });
        } else {
          setAssignmentNotice({
            type: "success",
            text: `Assignment "${newAssignment.title}" created successfully.`,
          });
        }
      } else {
        setAssignmentNotice({ type: "error", text: await readError(response) });
      }
    } catch (error) {
      const timedOut =
        error instanceof DOMException && error.name === "AbortError";

      setAssignmentNotice({
        type: "error",
        text: timedOut
          ? "The server is taking too long. The assignment may have been created, so refresh before trying again."
          : "Could not reach the server. Please try again.",
      });
    } finally {
      clearTimeout(timer);
      setCreatingAssignment(false);
    }
  }

  return (
    <>
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">LECTURER PORTAL</p>
          <h1>Assignments</h1>
          <p className="dashboard-description">
            Create assessments for your courses.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="assignments-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">ASSESSMENTS</p>
            <h2>Create Assignment</h2>
            <p>Create an assessment for one of your courses.</p>
          </div>
        </div>

        {lecturerCourses.length === 0 ? (
          <div className="dashboard-empty">
            <p>You need a course before you can create assignments.</p>
          </div>
        ) : (
          <form onSubmit={createAssignment}>
            <div className="dashboard-form-field">
              <label>Course</label>
              <select
                value={assignmentCourseId}
                onChange={(event) => setAssignmentCourseId(event.target.value)}
                required
              >
                <option value="">Select your course</option>
                {lecturerCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="dashboard-form-field">
              <label>Assignment title</label>
              <input
                type="text"
                placeholder="Enter assignment title"
                value={assignmentTitle}
                onChange={(event) => setAssignmentTitle(event.target.value)}
                required
              />
            </div>

            <div className="dashboard-form-field dashboard-form-wide">
              <label>Description</label>
              <input
                type="text"
                placeholder="Assignment instructions"
                value={assignmentDescription}
                onChange={(event) => setAssignmentDescription(event.target.value)}
                required
              />
            </div>

            <div className="dashboard-form-field">
              <label>Due date</label>
              <input
                type="datetime-local"
                value={assignmentDueDate}
                onChange={(event) => setAssignmentDueDate(event.target.value)}
                required
              />
            </div>

            <div className="dashboard-form-field">
              <label>Total marks</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={assignmentTotalMarks}
                onChange={(event) => setAssignmentTotalMarks(event.target.value)}
                required
              />
            </div>

            <div className="dashboard-form-field dashboard-form-wide">
              <label>Instructions PDF (optional)</label>
              <input
                key={fileInputKey}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) =>
                  setInstructionsFile(event.target.files?.[0] ?? null)
                }
              />
            </div>

            {assignmentNotice && (
              <div
                className={
                  assignmentNotice.type === "success"
                    ? "dashboard-success"
                    : "dashboard-error"
                }
              >
                {assignmentNotice.text}
              </div>
            )}

            <div className="dashboard-form-actions">
              <button type="submit" disabled={creatingAssignment}>
                {creatingAssignment ? "Creating..." : "Create Assignment"}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}

export default LecturerAssignments;