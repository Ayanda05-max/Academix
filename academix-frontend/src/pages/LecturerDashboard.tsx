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

type Lesson = {
  id: number;
  title: string;
  description: string;
  contentUrl: string | null;
  contentType: string | null;
  orderNumber: number | null;
  durationMinutes: number | null;
  isFreePreview: boolean;
};

function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [courseError, setCourseError] = useState<string>("");

  const [courseName, setCourseName] = useState<string>("");
  const [courseCategory, setCourseCategory] = useState<string>("");
  const [courseDescription, setCourseDescription] = useState<string>("");

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonDescription, setLessonDescription] = useState<string>("");

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

  const lecturerId = Number(localStorage.getItem("userId"));

  const lecturerCourses = courses.filter(
    (course) => course.instructorId === lecturerId
  );

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

        // Load lessons only for courses owned by this lecturer
        for (const course of data) {
          if (course.instructorId === lecturerId) {
            await loadLessons(course.id);
          }
        }
      } else {
        setCourseError("Could not load courses.");
      }
    } catch (error) {
      setCourseError("ERROR: " + String(error));
    }
  }

  async function loadLessons(courseId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `/api/courses/${courseId}/lessons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: Lesson[] = await response.json();

        setLessons((currentLessons) => ({
          ...currentLessons,
          [courseId]: data,
        }));
      }
    } catch (error) {
      console.error("Could not load lessons:", error);
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

        setCourses((currentCourses) => [
          ...currentCourses,
          newCourse,
        ]);

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

  async function addLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in.");
      return;
    }

    if (!selectedCourseId) {
      alert("Please select a course.");
      return;
    }

    try {
      const response = await fetch(
        `/api/courses/${selectedCourseId}/lessons`,
        {
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
        }
      );

      if (response.ok) {
        const newLesson: Lesson = await response.json();

        const courseId = Number(selectedCourseId);

        setLessons((currentLessons) => ({
          ...currentLessons,
          [courseId]: [
            ...(currentLessons[courseId] || []),
            newLesson,
          ],
        }));

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

            {course.instructorId === lecturerId && (
              <div>
                <h4>Lessons</h4>

                {!lessons[course.id] ||
                lessons[course.id].length === 0 ? (
                  <p>No lessons added yet.</p>
                ) : (
                  lessons[course.id].map((lesson, index) => (
                    <div key={lesson.id}>
                      <p>
                        {index + 1}. {lesson.title}
                      </p>

                      {lesson.description && (
                        <p>{lesson.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lessons-section">
        <h2>Add Lesson</h2>

        {lecturerCourses.length === 0 ? (
          <p>You do not have any courses to add lessons to.</p>
        ) : (
          <form onSubmit={addLesson}>
            <select
              value={selectedCourseId}
              onChange={(event) =>
                setSelectedCourseId(event.target.value)
              }
              required
            >
              <option value="">Select your course</option>

              {lecturerCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Lesson title"
              value={lessonTitle}
              onChange={(event) =>
                setLessonTitle(event.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Lesson description"
              value={lessonDescription}
              onChange={(event) =>
                setLessonDescription(event.target.value)
              }
            />

            <button type="submit">Add Lesson</button>
          </form>
        )}
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