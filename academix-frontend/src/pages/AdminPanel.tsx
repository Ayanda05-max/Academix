import { useEffect, useState } from "react";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  instructorId: number | null;
  instructorName: string | null;
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

function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [courseName, setCourseName] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [enrollmentCourse, setEnrollmentCourse] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You must log in first");
        return;
      }

      try {
        // Load users
        const usersResponse = await fetch("/api/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else {
          alert("Could not load users");
        }

        // Load courses
        const coursesResponse = await fetch("/api/courses", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (coursesResponse.ok) {
          const coursesData: Course[] = await coursesResponse.json();
          setCourses(coursesData);

          // Load enrollments for every course
          const allEnrollments: Enrollment[] = [];

          for (const course of coursesData) {
            const enrollmentResponse = await fetch(
              `/api/enrollments/course/${course.id}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (enrollmentResponse.ok) {
              const enrollmentData: Enrollment[] =
                await enrollmentResponse.json();

              allEnrollments.push(...enrollmentData);
            }
          }

          setEnrollments(allEnrollments);
        } else {
          alert("Could not load courses");
        }
      } catch (error) {
        alert("ERROR: " + String(error));
      }
    }

    loadData();
  }, []);

  // Delete a user from the backend/database
  async function deleteUser(id: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must log in first");
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== id));
        alert("User deleted successfully");
      } else {
        alert("Could not delete user");
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Add a course to the backend/database
  async function addCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must log in first");
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

        setCourses([...courses, newCourse]);
        setCourseName("");

        alert("Course added successfully");
      } else {
        alert("Could not add course");
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Delete a course from the backend/database
  async function deleteCourse(id: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must log in first");
      return;
    }

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCourses(courses.filter((course) => course.id !== id));

        setEnrollments(
          enrollments.filter(
            (enrollment) => enrollment.courseId !== id
          )
        );

        alert("Course deleted successfully");
      } else {
        alert("Could not delete course");
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Enrollment creation is still local for now.
  // We will connect this after course publishing is handled.
  function addEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    alert(
      "Enrollment creation will be connected after course publishing is set up."
    );
  }

  // Enrollment deletion will be connected next
  function deleteEnrollment(id: number) {
    setEnrollments(
      enrollments.filter((enrollment) => enrollment.id !== id)
    );
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <p>Manage users, courses and student enrollments.</p>

      {/* USERS */}
      <section className="admin-section">
        <h2>Manage Users</h2>

        <div className="admin-list">
          {users.map((user) => (
            <div className="admin-card" key={user.id}>
              <h3>
                {user.firstName} {user.lastName}
              </h3>

              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>

              <button onClick={() => deleteUser(user.id)}>
                Delete User
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* COURSES */}
      <section className="admin-section">
        <h2>Manage Courses</h2>

        <form className="admin-form" onSubmit={addCourse}>
          <input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            required
          />

          <button type="submit">Add Course</button>
        </form>

        <div className="admin-list">
          {courses.map((course) => (
            <div className="admin-card" key={course.id}>
              <h3>{course.title}</h3>

              <p>
                Category: {course.category || "Not specified"}
              </p>

              <p>Status: {course.status}</p>

              {course.instructorName && (
                <p>Instructor: {course.instructorName}</p>
              )}

              <button onClick={() => deleteCourse(course.id)}>
                Delete Course
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ENROLLMENTS */}
      <section className="admin-section">
        <h2>Manage Enrollments</h2>

        <form className="admin-form" onSubmit={addEnrollment}>
          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Course Name"
            value={enrollmentCourse}
            onChange={(event) =>
              setEnrollmentCourse(event.target.value)
            }
            required
          />

          <button type="submit">Enroll Student</button>
        </form>

        <div className="admin-list">
          {enrollments.map((enrollment) => (
            <div className="admin-card" key={enrollment.id}>
              <h3>{enrollment.studentName}</h3>

              <p>Email: {enrollment.studentEmail}</p>
              <p>Course: {enrollment.courseTitle}</p>
              <p>Status: {enrollment.status}</p>

              <button
                onClick={() => deleteEnrollment(enrollment.id)}
              >
                Remove Enrollment
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminPanel;