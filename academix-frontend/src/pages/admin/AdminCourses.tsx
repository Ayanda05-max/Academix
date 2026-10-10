import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { readError } from "../../utils/readError";

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  instructorId: number | null;
  instructorName: string | null;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
};

function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState<
    Record<number, string>
  >({});
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadData();
  }, []);

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  async function loadData() {
    if (!token) {
      showMessage("You must log in first.", "error");
      setLoading(false);
      return;
    }

    try {
      const coursesResponse = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (coursesResponse.ok) {
        const data: Course[] = await coursesResponse.json();
        setCourses(data);
      } else {
        showMessage("Could not load courses.", "error");
      }

      const usersResponse = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersResponse.ok) {
        const users: User[] = await usersResponse.json();
        setLecturers(users.filter((user) => user.role === "LECTURER"));
      } else {
        showMessage("Could not load lecturers.", "error");
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      showMessage("You must log in first.", "error");
      return;
    }

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: courseName,
          description: "",
          category: "",
        }),
      });

      if (response.ok) {
        const newCourse: Course = await response.json();

        setCourses((currentCourses) => [...currentCourses, newCourse]);
        setCourseName("");

        showMessage(`Course "${newCourse.title}" was created.`, "success");
      } else {
        showMessage(
          (await readError(response)) || "Could not create course.",
          "error"
        );
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    }
  }

  function currentLecturerValue(course: Course) {
    if (selectedLecturer[course.id] !== undefined) {
      return selectedLecturer[course.id];
    }

    const isLecturer = lecturers.some(
      (lecturer) => lecturer.id === course.instructorId
    );

    return isLecturer && course.instructorId ? String(course.instructorId) : "";
  }

  async function assignLecturer(course: Course) {
    if (!token) {
      showMessage("You must log in first.", "error");
      return;
    }

    const lecturerId = currentLecturerValue(course);

    if (!lecturerId) {
      showMessage("Please select a lecturer.", "error");
      return;
    }

    if (assigningId !== null) return;

    setAssigningId(course.id);

    try {
      const response = await fetch(
        `/api/courses/${course.id}/instructor?instructorId=${lecturerId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const updated: Course = await response.json();

        setCourses((currentCourses) =>
          currentCourses.map((item) => (item.id === course.id ? updated : item))
        );

        setSelectedLecturer((current) => {
          const next = { ...current };
          delete next[course.id];
          return next;
        });

        showMessage(
          `${updated.instructorName} was assigned to "${updated.title}".`,
          "success"
        );
      } else {
        showMessage(
          (await readError(response)) || "Could not assign lecturer.",
          "error"
        );
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    } finally {
      setAssigningId(null);
    }
  }

  async function deleteCourse(id: number, force = false) {
    if (!token) {
      showMessage("You must log in first.", "error");
      return;
    }

    const course = courses.find((item) => item.id === id);
    const title = course ? `"${course.title}"` : "this course";

    if (!force) {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${title}?`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      const response = await fetch(
        `/api/courses/${id}${force ? "?force=true" : ""}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setCourses((currentCourses) =>
          currentCourses.filter((item) => item.id !== id)
        );

        showMessage(`Course ${title} was deleted.`, "success");
      } else if (response.status === 409 && !force) {
        const reason = await readError(response);

        const proceed = window.confirm(
          `${reason}\n\nDeleting ${title} will also permanently delete its lessons, assignments, quizzes, student submissions and uploaded files, grades, quiz results and enrolments. This cannot be undone.\n\nDelete anyway?`
        );

        if (proceed) {
          await deleteCourse(id, true);
        }
      } else {
        showMessage(
          (await readError(response)) || "Could not delete course.",
          "error"
        );
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    }
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ADMIN PORTAL</p>

          <h1>Courses</h1>

          <p className="dashboard-description">
            Create courses, assign lecturers and manage existing course
            records.
          </p>
        </div>
      </header>

      {message && (
        <div
          className={
            messageType === "success"
              ? "admin-message admin-message-success"
              : "admin-message admin-message-error"
          }
        >
          <span>{message}</span>

          <button
            type="button"
            className="message-close"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading administration data...</div>
      ) : (
        <section className="admin-section admin-modern-section">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">COURSE MANAGEMENT</p>
              <h2>Courses</h2>
              <p>Create courses and choose which lecturer runs each one.</p>
            </div>

            <span className="section-count">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </span>
          </div>

          <div className="admin-action-panel">
            <div className="admin-action-copy">
              <h3>Create a course</h3>

              <p>
                Add a new course record to Academix, then assign a lecturer to
                it below.
              </p>
            </div>

            <form className="admin-inline-form" onSubmit={addCourse}>
              <div className="dashboard-form-field">
                <label htmlFor="course-name">Course name</label>

                <input
                  id="course-name"
                  type="text"
                  placeholder="e.g. Applied Mathematics"
                  value={courseName}
                  onChange={(event) => setCourseName(event.target.value)}
                  required
                />
              </div>

              <button type="submit">Add Course</button>
            </form>
          </div>

          {courses.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No courses found</h3>
              <p>Create the first course using the form above.</p>
            </div>
          ) : (
            <div className="admin-course-grid">
              {courses.map((course) => {
                const selected = currentLecturerValue(course);
                const hasLecturer = lecturers.some(
                  (lecturer) => lecturer.id === course.instructorId
                );
                const unchanged = selected === String(course.instructorId);

                return (
                  <article className="admin-course-card" key={course.id}>
                    <div className="admin-course-header">
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

                    <p className="admin-course-description">
                      {course.description ||
                        "No course description has been added yet."}
                    </p>

                    <div className="admin-course-meta">
                      <div>
                        <span>Instructor</span>

                        <strong>
                          {course.instructorName || "Not assigned"}
                        </strong>
                      </div>

                      <div>
                        <span>Course ID</span>

                        <strong>#{course.id}</strong>
                      </div>
                    </div>

                    <div className="dashboard-form-field">
                      <label htmlFor={`lecturer-${course.id}`}>Lecturer</label>

                      <select
                        id={`lecturer-${course.id}`}
                        value={selected}
                        onChange={(event) =>
                          setSelectedLecturer((current) => ({
                            ...current,
                            [course.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select lecturer</option>

                        {lecturers.map((lecturer) => (
                          <option key={lecturer.id} value={lecturer.id}>
                            {lecturer.firstName} {lecturer.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-course-footer">
                      <button
                        type="button"
                        onClick={() => assignLecturer(course)}
                        disabled={
                          assigningId === course.id || !selected || unchanged
                        }
                      >
                        {assigningId === course.id
                          ? "Assigning..."
                          : hasLecturer
                          ? "Reassign lecturer"
                          : "Assign lecturer"}
                      </button>

                      <button
                        type="button"
                        className="danger-outline-button"
                        onClick={() => deleteCourse(course.id)}
                      >
                        Delete Course
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default AdminCourses;