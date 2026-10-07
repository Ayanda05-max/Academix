import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  instructorId: number | null;
  instructorName: string | null;
};

function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadCourses();
  }, []);

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  // Load courses
  async function loadCourses() {
    if (!token) {
      showMessage("You must log in first.", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Course[] = await response.json();
        setCourses(data);
      } else {
        showMessage("Could not load courses.", "error");
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Add course
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

        showMessage("Course created successfully.", "success");
      } else {
        showMessage("Could not create course.", "error");
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    }
  }

  // Delete course
  async function deleteCourse(id: number) {
    if (!token) {
      showMessage("You must log in first.", "error");
      return;
    }

    const course = courses.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        course ? `"${course.title}"` : "this course"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCourses((currentCourses) =>
          currentCourses.filter((course) => course.id !== id)
        );

        showMessage("Course deleted successfully.", "success");
      } else {
        showMessage("Could not delete course.", "error");
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    }
  }

  return (
    <>
      {/* HEADER */}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ADMIN PORTAL</p>

          <h1>Courses</h1>

          <p className="dashboard-description">
            Create courses and manage existing course records.
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
              <p>Create courses and manage existing course records.</p>
            </div>

            <span className="section-count">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </span>
          </div>

          <div className="admin-action-panel">
            <div className="admin-action-copy">
              <h3>Create a course</h3>

              <p>
                Add a new course record to Academix. Course content can be
                managed afterwards.
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
              {courses.map((course) => (
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

                      <strong>{course.instructorName || "Not assigned"}</strong>
                    </div>

                    <div>
                      <span>Course ID</span>

                      <strong>#{course.id}</strong>
                    </div>
                  </div>

                  <div className="admin-course-footer">
                    <button
                      type="button"
                      className="danger-outline-button"
                      onClick={() => deleteCourse(course.id)}
                    >
                      Delete Course
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default AdminCourses;
