import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Course = {
  id: number;
  title: string;
  instructorId: number | null;
};

type Assignment = {
  id: number;
  courseId: number;
  title: string;
};

function LecturerAssignments() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string>("");

  // Assignment form
  const [assignmentCourseId, setAssignmentCourseId] = useState<string>("");
  const [assignmentTitle, setAssignmentTitle] = useState<string>("");
  const [assignmentDescription, setAssignmentDescription] =
    useState<string>("");
  const [assignmentDueDate, setAssignmentDueDate] = useState<string>("");
  const [assignmentTotalMarks, setAssignmentTotalMarks] = useState<string>("");

  const token = localStorage.getItem("token");
  const lecturerId = Number(localStorage.getItem("userId"));

  const lecturerCourses = courses.filter(
    (course) => course.instructorId === lecturerId
  );

  useEffect(() => {
    loadCourses();
  }, []);

  // Load courses
  async function loadCourses() {
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

  // Create assignment
  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      alert("You must be logged in.");
      return;
    }

    if (!assignmentCourseId) {
      alert("Please select a course.");
      return;
    }

    if (Number(assignmentTotalMarks) <= 0) {
      alert("Total marks must be greater than 0.");
      return;
    }

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
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

        setAssignmentCourseId("");
        setAssignmentTitle("");
        setAssignmentDescription("");
        setAssignmentDueDate("");
        setAssignmentTotalMarks("");

        alert(`Assignment "${newAssignment.title}" created successfully`);
      } else {
        const message = await response.text();

        alert("Could not create assignment: " + message);
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  return (
    <>
      {/* HEADER */}

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

      {/* CREATE ASSIGNMENT */}

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
                onChange={(event) =>
                  setAssignmentDescription(event.target.value)
                }
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
                onChange={(event) =>
                  setAssignmentTotalMarks(event.target.value)
                }
                required
              />
            </div>

            <div className="dashboard-form-actions">
              <button type="submit">Create Assignment</button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}

export default LecturerAssignments;
