import { useEffect, useState } from "react";

type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  enrolledAt: string;
  status: string;
};

type Lesson = {
  id: number;
  title: string;
  description: string;
  contentUrl: string | null;
  contentType: string | null;
  orderNumber: number | null;
};

function MyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});

  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");
  const studentId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    loadEnrollments();
  }, []);

  // Load the courses the student is enrolled in
  async function loadEnrollments() {
    if (!token) {
      setError("You must be logged in to view your courses.");
      return;
    }

    try {
      const response = await fetch(`/api/enrollments/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Enrollment[] = await response.json();

        setEnrollments(data);
        setError("");

        for (const enrollment of data) {
          if (enrollment.status === "ACTIVE") {
            await loadLessons(enrollment.courseId);
          }
        }
      } else {
        setError("Could not load your courses.");
      }
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  // Load the lessons of one course
  async function loadLessons(courseId: number) {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Lesson[] = await response.json();

        data.sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));

        setLessons((current) => ({
          ...current,
          [courseId]: data,
        }));
      }
    } catch (error) {
      console.error("Could not load lessons:", error);
    }
  }

  return (
    <>
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">STUDENT PORTAL</p>

          <h1>My Courses</h1>

          <p className="dashboard-description">
            The courses you are enrolled in and their lessons.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* ENROLLED COURSES */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">ENROLMENTS</p>
            <h2>Enrolled Courses</h2>
            <p>Open a lesson material from the list under each course.</p>
          </div>
        </div>

        {enrollments.length === 0 && !error && (
          <div className="dashboard-empty">
            <h3>No courses yet</h3>
            <p>
              Ask an administrator or lecturer to enrol you in a course.
            </p>
          </div>
        )}

        <div className="course-grid">
          {enrollments.map((enrollment) => (
            <article className="course-card" key={enrollment.id}>
              <div className="course-card-header">
                <div>
                  <p className="course-category">COURSE</p>

                  <h3>{enrollment.courseTitle}</h3>
                </div>

                <span
                  className={`status-badge ${
                    enrollment.status === "ACTIVE"
                      ? "status-published"
                      : "status-draft"
                  }`}
                >
                  {enrollment.status}
                </span>
              </div>

              <p className="course-description">
                Enrolled on{" "}
                {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </p>

              <div className="course-content-block">
                <h4>Lessons</h4>

                {!lessons[enrollment.courseId] ||
                lessons[enrollment.courseId].length === 0 ? (
                  <p className="muted-text">No lessons available yet.</p>
                ) : (
                  <div className="compact-list">
                    {lessons[enrollment.courseId].map((lesson, index) => (
                      <div className="compact-list-item" key={lesson.id}>
                        <span className="list-number">{index + 1}</span>

                        <div>
                          <strong>{lesson.title}</strong>

                          {lesson.description && <p>{lesson.description}</p>}

                          {lesson.contentUrl && (
                            <a
                              href={lesson.contentUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open material
                            </a>
                          )}
                        </div>
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

export default MyCourses;