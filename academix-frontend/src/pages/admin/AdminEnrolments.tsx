import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
};

type Course = {
  id: number;
  title: string;
  status: string;
};

type Enrollment = {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  enrolledAt: string;
  status: string;
};

function AdminEnrolments() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const token = localStorage.getItem("token");

  const students = users.filter((user) => user.role === "STUDENT");
  const publishedCourses = courses.filter(
    (course) => course.status === "PUBLISHED"
  );

  useEffect(() => {
    loadData();
  }, []);

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  // Load users, courses and enrolments
  async function loadData() {
    if (!token) {
      showMessage("You must log in first.", "error");
      setLoading(false);
      return;
    }

    try {
      const usersResponse = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersResponse.ok) {
        const usersData: User[] = await usersResponse.json();
        setUsers(usersData);
      } else {
        showMessage("Could not load users.", "error");
      }

      const coursesResponse = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (coursesResponse.ok) {
        const coursesData: Course[] = await coursesResponse.json();
        setCourses(coursesData);

        const allEnrollments: Enrollment[] = [];

        for (const course of coursesData) {
          const enrollmentResponse = await fetch(
            `/api/enrollments/course/${course.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (enrollmentResponse.ok) {
            const enrollmentData: Enrollment[] =
              await enrollmentResponse.json();

            allEnrollments.push(...enrollmentData);
          }
        }

        setEnrollments(allEnrollments);
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

  // Enrol a student
  async function addEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      showMessage("You must log in first.", "error");
      return;
    }

    if (!selectedStudentId || !selectedCourseId) {
      showMessage("Please select a student and a course.", "error");
      return;
    }

    const studentId = selectedStudentId;

    try {
      const response = await fetch(
        `/api/enroll?studentId=${selectedStudentId}&courseId=${selectedCourseId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setSelectedStudentId("");
        setSelectedCourseId("");

        const enrollmentResponse = await fetch(
          `/api/enrollments/student/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (enrollmentResponse.ok) {
          const studentEnrollments: Enrollment[] =
            await enrollmentResponse.json();

          setEnrollments((currentEnrollments) => {
            const otherEnrollments = currentEnrollments.filter(
              (enrollment) => enrollment.studentId !== Number(studentId)
            );

            return [...otherEnrollments, ...studentEnrollments];
          });
        }

        showMessage("Student enrolled successfully.", "success");
      } else {
        const responseMessage = await response.text();

        showMessage(responseMessage || "Could not enrol student.", "error");
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    }
  }

  // Remove an enrolment
  async function deleteEnrollment(enrollment: Enrollment) {
    if (!token) {
      showMessage("You must log in first.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${enrollment.studentName} from ${enrollment.courseTitle}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/enroll?studentId=${enrollment.studentId}&courseId=${enrollment.courseId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setEnrollments((currentEnrollments) =>
          currentEnrollments.filter((item) => item.id !== enrollment.id)
        );

        showMessage("Enrollment removed successfully.", "success");
      } else {
        const responseMessage = await response.text();

        showMessage(
          responseMessage || "Could not remove enrollment.",
          "error"
        );
      }
    } catch (error) {
      showMessage("Could not connect to the server.", "error");
      console.error(error);
    }
  }

  function formatDate(date: string) {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      {/* HEADER */}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ADMIN PORTAL</p>

          <h1>Enrolments</h1>

          <p className="dashboard-description">
            Assign students to published courses and manage existing
            enrolments.
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
              <p className="section-eyebrow">ENROLMENT MANAGEMENT</p>
              <h2>Student Enrolments</h2>
              <p>
                Assign registered students to published courses and manage
                existing enrolments.
              </p>
            </div>

            <span className="section-count">
              {enrollments.length}{" "}
              {enrollments.length === 1 ? "enrolment" : "enrolments"}
            </span>
          </div>

          <div className="admin-action-panel">
            <div className="admin-action-copy">
              <h3>Enrol a student</h3>

              <p>
                Students can only be enrolled into courses that have been
                published.
              </p>
            </div>

            <form className="admin-enrollment-form" onSubmit={addEnrollment}>
              <div className="dashboard-form-field">
                <label htmlFor="student-select">Student</label>

                <select
                  id="student-select"
                  value={selectedStudentId}
                  onChange={(event) => setSelectedStudentId(event.target.value)}
                  required
                >
                  <option value="">Select student</option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dashboard-form-field">
                <label htmlFor="course-select">Published course</label>

                <select
                  id="course-select"
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                  required
                >
                  <option value="">Select course</option>

                  {publishedCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit">Enrol Student</button>
            </form>
          </div>

          {enrollments.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No enrolments found</h3>
              <p>Student course enrolments will appear here.</p>
            </div>
          ) : (
            <div className="enrollment-table-wrapper">
              <table className="enrollment-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Enrolled</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>
                        <div className="table-student">
                          <strong>{enrollment.studentName}</strong>

                          <span>{enrollment.studentEmail}</span>
                        </div>
                      </td>

                      <td>{enrollment.courseTitle}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            enrollment.status === "ACTIVE"
                              ? "status-published"
                              : "status-draft"
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>

                      <td>{formatDate(enrollment.enrolledAt)}</td>

                      <td className="table-action-cell">
                        <button
                          type="button"
                          className="danger-outline-button"
                          onClick={() => deleteEnrollment(enrollment)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default AdminEnrolments;
