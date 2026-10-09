import { useEffect, useState } from "react";
import { Users, GraduationCap, BookOpen, ListChecks } from "lucide-react";
import "../dashboardPanels.css";
import "./adminHome.css";

type User = {
  id: number;
  role: string;
};

type Course = {
  id: number;
  status: string;
};

type Enrollment = {
  id: number;
  status: string;
};

function AdminHome() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");

  const students = users.filter((user) => user.role === "STUDENT");
  const lecturers = users.filter((user) => user.role === "LECTURER");
  const publishedCourses = courses.filter(
    (course) => course.status === "PUBLISHED"
  );
  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "ACTIVE"
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  // Load everything the dashboard needs
  async function loadDashboard() {
    if (!token) {
      setError("You must log in first.");
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
        setError("Could not load users.");
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
        setError("Could not load courses.");
      }
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  return (
    <>
      {/* HEADER */}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ADMIN PORTAL</p>

          <h1>Admin Dashboard</h1>

          <p className="dashboard-description">
            Manage Academix users, courses and student enrolments from one
            central workspace.
          </p>
        </div>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      {/* OVERVIEW */}

      <div className="dashboard-cards admin-dashboard-cards">
        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">TOTAL USERS</p>
            <span className="stat-icon">
              <Users size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{users.length}</div>
          <p>
            {students.length} students &middot; {lecturers.length} lecturers
          </p>
        </div>

        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">STUDENTS</p>
            <span className="stat-icon">
              <GraduationCap size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{students.length}</div>
          <p>Registered student accounts</p>
        </div>

        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">COURSES</p>
            <span className="stat-icon">
              <BookOpen size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{courses.length}</div>
          <p>{publishedCourses.length} currently published</p>
        </div>

        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">ACTIVE ENROLMENTS</p>
            <span className="stat-icon">
              <ListChecks size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">
            {activeEnrollments.length}
          </div>
          <p>Current course enrolments</p>
        </div>
      </div>
    </>
  );
}

export default AdminHome;
