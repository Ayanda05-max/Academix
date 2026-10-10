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

type Lesson = {
  id: number;
  title: string;
  description: string;
};

type Assignment = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
};

function LecturerCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [assignments, setAssignments] = useState<Record<number, Assignment[]>>(
    {}
  );
  const [courseError, setCourseError] = useState<string>("");

  // Course form
  const [courseName, setCourseName] = useState<string>("");
  const [courseCategory, setCourseCategory] = useState<string>("");
  const [courseDescription, setCourseDescription] = useState<string>("");

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
      setCourseError("You must be logged in to view courses.");
      return;
    }

    try {
      const response = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Course[] = await response.json();

        setCourses(data);
        setCourseError("");

        for (const course of data) {
          if (course.instructorId === lecturerId) {
            await loadLessons(course.id);
            await loadAssignments(course.id);
          }
        }
      } else {
        setCourseError("Could not load courses.");
      }
    } catch (error) {
      setCourseError("ERROR: " + String(error));
    }
  }

  // Load lessons
  async function loadLessons(courseId: number) {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Lesson[] = await response.json();

        setLessons((current) => ({
          ...current,
          [courseId]: data,
        }));
      }
    } catch (error) {
      console.error("Could not load lessons:", error);
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
      }
    } catch (error) {
      console.error("Could not load assignments:", error);
    }
  }

  // Add course
  async function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      alert("You must be logged in.");
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
          description: courseDescription,
          category: courseCategory,
        }),
      });

      if (response.ok) {
        const newCourse: Course = await response.json();

        setCourses((current) => [...current, newCourse]);

        setCourseName("");
        setCourseCategory("");
        setCourseDescription("");

        alert("Course created successfully");
      } else {
        const message = await response.text();

        alert("Could not create course: " + message);
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Publish course
  async function publishCourse(courseId: number) {
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const updatedCourse: Course = await response.json();

        setCourses((current) =>
          current.map((course) =>
            course.id === courseId ? updatedCourse : course
          )
        );

        alert("Course published successfully");
      } else {
        const message = await readError(response);

        alert("Could not publish course: " + message);
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

          <h1>My Courses</h1>

          <p className="dashboard-description">
            Create and manage the courses assigned to you.
          </p>
        </div>
      </div>

      {/* MANAGE COURSES */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">COURSE MANAGEMENT</p>
            <h2>Courses</h2>
            <p>Create a course, then publish it when it is ready.</p>
          </div>
        </div>

        <form onSubmit={addCourse}>
          <div className="dashboard-form-field">
            <label>Course name</label>

            <input
              type="text"
              placeholder="e.g. Java Programming"
              value={courseName}
              onChange={(event) => setCourseName(event.target.value)}
              required
            />
          </div>

          <div className="dashboard-form-field">
            <label>Category</label>

            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={courseCategory}
              onChange={(event) => setCourseCategory(event.target.value)}
            />
          </div>

          <div className="dashboard-form-field dashboard-form-wide">
            <label>Description</label>

            <input
              type="text"
              placeholder="Brief course description"
              value={courseDescription}
              onChange={(event) => setCourseDescription(event.target.value)}
            />
          </div>

          <div className="dashboard-form-actions">
            <button type="submit">Create Course</button>
          </div>
        </form>

        {courseError && <div className="dashboard-error">{courseError}</div>}

        {lecturerCourses.length === 0 && !courseError && (
          <div className="dashboard-empty">
            <h3>No courses yet</h3>
            <p>Create your first course using the form above.</p>
          </div>
        )}

        <div className="course-grid">
          {lecturerCourses.map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-card-header">
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

              <p className="course-description">
                {course.description || "No course description provided."}
              </p>

              <div className="course-meta">
                <span>
                  <strong>Instructor:</strong>{" "}
                  {course.instructorName || "Not assigned"}
                </span>

                <span>
                  <strong>Lessons:</strong> {lessons[course.id]?.length || 0}
                </span>

                <span>
                  <strong>Assignments:</strong>{" "}
                  {assignments[course.id]?.length || 0}
                </span>
              </div>

              {course.status === "DRAFT" && (
                <div className="course-actions">
                  <button
                    type="button"
                    onClick={() => publishCourse(course.id)}
                  >
                    Publish Course
                  </button>
                </div>
              )}

              <div className="course-content-block">
                <h4>Lessons</h4>

                {!lessons[course.id] || lessons[course.id].length === 0 ? (
                  <p className="muted-text">No lessons added yet.</p>
                ) : (
                  <div className="compact-list">
                    {lessons[course.id].map((lesson, index) => (
                      <div className="compact-list-item" key={lesson.id}>
                        <span className="list-number">{index + 1}</span>

                        <div>
                          <strong>{lesson.title}</strong>

                          {lesson.description && <p>{lesson.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="course-content-block">
                <h4>Assignments</h4>

                {!assignments[course.id] ||
                assignments[course.id].length === 0 ? (
                  <p className="muted-text">No assignments created yet.</p>
                ) : (
                  <div className="compact-list">
                    {assignments[course.id].map((assignment) => (
                      <div className="assignment-summary" key={assignment.id}>
                        <div className="assignment-summary-header">
                          <strong>{assignment.title}</strong>

                          <span>{assignment.totalMarks} marks</span>
                        </div>

                        <p>{assignment.description}</p>

                        <small>
                          Due {new Date(assignment.dueDate).toLocaleString()}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default LecturerCourses;
