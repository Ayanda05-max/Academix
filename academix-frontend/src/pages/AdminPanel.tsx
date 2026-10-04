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
  student: string;
  course: string;
};

function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Enrollments are still local for now
  const [enrollments, setEnrollments] = useState<Enrollment[]>([
    { id: 1, student: "Thabo", course: "Programming" },
  ]);

  const [courseName, setCourseName] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [enrollmentCourse, setEnrollmentCourse] = useState<string>("");

  useEffect(() => {
    // Load users from the backend
    async function loadUsers() {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You must log in first");
        return;
      }

      try {
        const response = await fetch("/api/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          alert("Could not load users");
        }
      } catch (error) {
        alert("ERROR: " + String(error));
      }
    }

    // Load courses from the backend
    async function loadCourses() {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch("/api/courses", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          alert("Could not load courses");
        }
      } catch (error) {
        alert("ERROR: " + String(error));
      }
    }

    loadUsers();
    loadCourses();
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
      alert("Course deleted successfully");
    } else {
      alert("Could not delete course");
    }
  } catch (error) {
    alert("ERROR: " + String(error));
  }
}

  // Add an enrollment locally for now
  function addEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newEnrollment: Enrollment = {
      id: Date.now(),
      student: studentName,
      course: enrollmentCourse,
    };

    setEnrollments([...enrollments, newEnrollment]);

    setStudentName("");
    setEnrollmentCourse("");
  }

  // Delete an enrollment locally for now
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

              <p>Category: {course.category || "Not specified"}</p>
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
            onChange={(event) => setEnrollmentCourse(event.target.value)}
            required
          />

          <button type="submit">Enroll Student</button>
        </form>

        <div className="admin-list">
          {enrollments.map((enrollment) => (
            <div className="admin-card" key={enrollment.id}>
              <h3>{enrollment.student}</h3>

              <p>Course: {enrollment.course}</p>

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