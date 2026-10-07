import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Course = {
  id: number;
  title: string;
  instructorId: number | null;
};

type Lesson = {
  id: number;
  title: string;
};

function LecturerLessons() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string>("");

  // Lesson form
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonDescription, setLessonDescription] = useState<string>("");

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

  // Add lesson
  async function addLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      alert("You must be logged in.");
      return;
    }

    if (!selectedCourseId) {
      alert("Please select a course.");
      return;
    }

    try {
      const response = await fetch(`/api/courses/${selectedCourseId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: lessonTitle,
          description: lessonDescription,
          contentType: "TEXT",
        }),
      });

      if (response.ok) {
        const newLesson: Lesson = await response.json();

        setLessonTitle("");
        setLessonDescription("");

        alert(`Lesson "${newLesson.title}" added successfully`);
      } else {
        const message = await response.text();

        alert("Could not add lesson: " + message);
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

          <h1>Lessons</h1>

          <p className="dashboard-description">
            Add learning material to your courses.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* ADD LESSON */}

      <section className="lessons-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">LEARNING CONTENT</p>
            <h2>Add Lesson</h2>
            <p>Add learning material to one of your courses.</p>
          </div>
        </div>

        {lecturerCourses.length === 0 ? (
          <div className="dashboard-empty">
            <p>You need a course before you can add lessons.</p>
          </div>
        ) : (
          <form onSubmit={addLesson}>
            <div className="dashboard-form-field">
              <label>Course</label>

              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
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
              <label>Lesson title</label>

              <input
                type="text"
                placeholder="Enter lesson title"
                value={lessonTitle}
                onChange={(event) => setLessonTitle(event.target.value)}
                required
              />
            </div>

            <div className="dashboard-form-field dashboard-form-wide">
              <label>Lesson description</label>

              <input
                type="text"
                placeholder="Brief lesson description"
                value={lessonDescription}
                onChange={(event) => setLessonDescription(event.target.value)}
              />
            </div>

            <div className="dashboard-form-actions">
              <button type="submit">Add Lesson</button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}

export default LecturerLessons;
