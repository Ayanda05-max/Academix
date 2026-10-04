import { useEffect, useState } from "react";

type Submission = {
  id: number;
  student: string;
  assignment: string;
  grade: string;
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

function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseError, setCourseError] = useState<string>("");

  const [courseName, setCourseName] = useState<string>("");
  const [courseCategory, setCourseCategory] = useState<string>("");
  const [courseDescription, setCourseDescription] = useState<string>("");

  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 1,
      student: "Thabo",
      assignment: "Programming Assignment 1",
      grade: "",
    },
    {
      id: 2,
      student: "Naledi",
      assignment: "Programming Assignment 1",
      grade: "",
    },
  ]);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const token = localStorage.getItem("token");

    if (!token) {
      setCourseError("You must be logged in to view courses.");
      return;
    }

    try {
      const response = await fetch("/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: Course[] = await response.json();
        setCourses(data);
        setCourseError("");
      } else {
        setCourseError("Could not load courses.");
      }
    } catch (error) {
      setCourseError("ERROR: " + String(error));
    }
  }

  async function addCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

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

        setCourses([...courses, newCourse]);

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

  function handleGrade(id: number, grade: string) {
    const updatedSubmissions = submissions.map((submission) =>
      submission.id === id
        ? { ...submission, grade: grade }
        : submission
    );

    setSubmissions(updatedSubmissions);
  }

  return (
    <div className="lecturer-dashboard">
      <h1>Lecturer Dashboard</h1>

      <p>Manage courses, view submissions and grade students.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Manage Courses</h3>
          <p>View and manage the courses you are teaching.</p>
        </div>

        <div className="dashboard-card">
          <h3>Submissions</h3>
          <p>View assignments submitted by students.</p>
          <button>View Submissions</button>
        </div>

        <div className="dashboard-card">
          <h3>Grading</h3>
          <p>Review student work and record grades.</p>
          <button>Grade Students</button>
        </div>
      </div>

      <div className="courses-section">
        <h2>Manage Courses</h2>

        <form onSubmit={addCourse}>
          <input
            type="text"
            placeholder="Course name"
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={courseCategory}
            onChange={(event) => setCourseCategory(event.target.value)}
          />

          <input
            type="text"
            placeholder="Description"
            value={courseDescription}
            onChange={(event) => setCourseDescription(event.target.value)}
          />

          <button type="submit">Add Course</button>
        </form>

        {courseError && <p>{courseError}</p>}

        {courses.length === 0 && !courseError && (
          <p>No courses available.</p>
        )}

        {courses.map((course) => (
          <div className="course-card" key={course.id}>
            <h3>{course.title}</h3>

            <p>
              Category: {course.category || "Not specified"}
            </p>

            <p>Status: {course.status}</p>

            <p>
              Instructor: {course.instructorName || "Not assigned"}
            </p>

            {course.description && (
              <p>Description: {course.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="submissions-section">
        <h2>Student Submissions</h2>

        {submissions.map((submission) => (
          <div className="submission-card" key={submission.id}>
            <h3>{submission.student}</h3>

            <p>Assignment: {submission.assignment}</p>

            <label>Grade:</label>

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Enter grade"
              value={submission.grade}
              onChange={(event) =>
                handleGrade(submission.id, event.target.value)
              }
            />

            {submission.grade && (
              <p>Current Grade: {submission.grade}%</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LecturerDashboard;