import { useEffect, useState } from "react";

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

type Assignment = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
};

type Submission = {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  fileUrl: string;
  submittedAt: string;
  status: string;
};

function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [assignments, setAssignments] =
    useState<Record<number, Assignment[]>>({});
  const [submissions, setSubmissions] =
    useState<Record<number, Submission[]>>({});

  const [courseError, setCourseError] = useState<string>("");

  // Course form
  const [courseName, setCourseName] = useState<string>("");
  const [courseCategory, setCourseCategory] = useState<string>("");
  const [courseDescription, setCourseDescription] =
    useState<string>("");

  // Lesson form
  const [selectedCourseId, setSelectedCourseId] =
    useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonDescription, setLessonDescription] =
    useState<string>("");

  // Assignment form
  const [assignmentCourseId, setAssignmentCourseId] =
    useState<string>("");
  const [assignmentTitle, setAssignmentTitle] =
    useState<string>("");
  const [assignmentDescription, setAssignmentDescription] =
    useState<string>("");
  const [assignmentDueDate, setAssignmentDueDate] =
    useState<string>("");
  const [assignmentTotalMarks, setAssignmentTotalMarks] =
    useState<string>("");

  const lecturerId = Number(localStorage.getItem("userId"));

  const lecturerCourses = courses.filter(
    (course) => course.instructorId === lecturerId
  );

  useEffect(() => {
    loadCourses();
  }, []);

  // Load courses from backend
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

        // Load lessons and assignments only for courses
        // owned by this lecturer
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

  // Load lessons for a course
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

  // Load assignments for a course
  async function loadAssignments(courseId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `/api/assignments/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: Assignment[] = await response.json();

        setAssignments((currentAssignments) => ({
          ...currentAssignments,
          [courseId]: data,
        }));

        // Load submissions for each assignment
        for (const assignment of data) {
          await loadSubmissions(assignment.id);
        }
      } else {
        console.error(
          `Could not load assignments for course ${courseId}`
        );
      }
    } catch (error) {
      console.error("Could not load assignments:", error);
    }
  }

  // Load submissions for one assignment
  async function loadSubmissions(assignmentId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `/api/assignments/${assignmentId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: Submission[] = await response.json();

        setSubmissions((currentSubmissions) => ({
          ...currentSubmissions,
          [assignmentId]: data,
        }));
      } else {
        console.error(
          `Could not load submissions for assignment ${assignmentId}`
        );
      }
    } catch (error) {
      console.error("Could not load submissions:", error);
    }
  }

  // Add a course
  async function addCourse(
    event: React.FormEvent<HTMLFormElement>
  ) {
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

  // Add a lesson
  async function addLesson(
    event: React.FormEvent<HTMLFormElement>
  ) {
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

  // Publish a course
  async function publishCourse(courseId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in.");
      return;
    }

    try {
      const response = await fetch(
        `/api/courses/${courseId}/publish`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const updatedCourse: Course = await response.json();

        setCourses((currentCourses) =>
          currentCourses.map((course) =>
            course.id === courseId ? updatedCourse : course
          )
        );

        alert("Course published successfully");
      } else {
        const message = await response.text();

        alert("Could not publish course: " + message);
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Create a real assignment
  async function createAssignment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in.");
      return;
    }

    if (!assignmentCourseId) {
      alert("Please select a course.");
      return;
    }

    if (Number(assignmentTotalMarks) <= 0) {
      alert("Total marks must be greater than 0.");
      return;
    }

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: Number(assignmentCourseId),
          title: assignmentTitle,
          description: assignmentDescription,
          dueDate: assignmentDueDate,
          totalMarks: Number(assignmentTotalMarks),
        }),
      });

      if (response.ok) {
        const newAssignment: Assignment =
          await response.json();

        const courseId = Number(assignmentCourseId);

        setAssignments((currentAssignments) => ({
          ...currentAssignments,
          [courseId]: [
            ...(currentAssignments[courseId] || []),
            newAssignment,
          ],
        }));

        // New assignment starts with no submissions
        setSubmissions((currentSubmissions) => ({
          ...currentSubmissions,
          [newAssignment.id]: [],
        }));

        setAssignmentCourseId("");
        setAssignmentTitle("");
        setAssignmentDescription("");
        setAssignmentDueDate("");
        setAssignmentTotalMarks("");

        alert(
          `Assignment "${newAssignment.title}" created successfully`
        );
      } else {
        const message = await response.text();

        alert("Could not create assignment: " + message);
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  return (
    <div className="lecturer-dashboard">
      <h1>Lecturer Dashboard</h1>

      <p>
        Manage courses, assignments, submissions and student
        grades.
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Manage Courses</h3>
          <p>View and manage the courses you are teaching.</p>
        </div>

        <div className="dashboard-card">
          <h3>Assignments</h3>
          <p>Create assignments for your courses.</p>
        </div>

        <div className="dashboard-card">
          <h3>Submissions</h3>
          <p>View assignments submitted by students.</p>
        </div>
      </div>

      {/* MANAGE COURSES */}
      <div className="courses-section">
        <h2>Manage Courses</h2>

        <form onSubmit={addCourse}>
          <input
            type="text"
            placeholder="Course name"
            value={courseName}
            onChange={(event) =>
              setCourseName(event.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={courseCategory}
            onChange={(event) =>
              setCourseCategory(event.target.value)
            }
          />

          <input
            type="text"
            placeholder="Description"
            value={courseDescription}
            onChange={(event) =>
              setCourseDescription(event.target.value)
            }
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
              Instructor:{" "}
              {course.instructorName || "Not assigned"}
            </p>

            {course.description && (
              <p>Description: {course.description}</p>
            )}

            {course.instructorId === lecturerId &&
              course.status === "DRAFT" && (
                <button
                  onClick={() => publishCourse(course.id)}
                >
                  Publish Course
                </button>
              )}

            {course.instructorId === lecturerId && (
              <div>
                <h4>Lessons</h4>

                {!lessons[course.id] ||
                lessons[course.id].length === 0 ? (
                  <p>No lessons added yet.</p>
                ) : (
                  lessons[course.id].map(
                    (lesson, index) => (
                      <div key={lesson.id}>
                        <p>
                          {index + 1}. {lesson.title}
                        </p>

                        {lesson.description && (
                          <p>{lesson.description}</p>
                        )}
                      </div>
                    )
                  )
                )}

                <h4>Assignments</h4>

                {!assignments[course.id] ||
                assignments[course.id].length === 0 ? (
                  <p>No assignments created yet.</p>
                ) : (
                  assignments[course.id].map(
                    (assignment) => (
                      <div key={assignment.id}>
                        <p>
                          <strong>{assignment.title}</strong>
                        </p>

                        <p>{assignment.description}</p>

                        <p>
                          Total Marks:{" "}
                          {assignment.totalMarks}
                        </p>

                        <p>
                          Due:{" "}
                          {new Date(
                            assignment.dueDate
                          ).toLocaleString()}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD LESSON */}
      <div className="lessons-section">
        <h2>Add Lesson</h2>

        {lecturerCourses.length === 0 ? (
          <p>
            You do not have any courses to add lessons to.
          </p>
        ) : (
          <form onSubmit={addLesson}>
            <select
              value={selectedCourseId}
              onChange={(event) =>
                setSelectedCourseId(event.target.value)
              }
              required
            >
              <option value="">
                Select your course
              </option>

              {lecturerCourses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
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

            <button type="submit">
              Add Lesson
            </button>
          </form>
        )}
      </div>

      {/* CREATE ASSIGNMENT */}
      <div className="assignments-section">
        <h2>Create Assignment</h2>

        {lecturerCourses.length === 0 ? (
          <p>
            You do not have any courses to create assignments
            for.
          </p>
        ) : (
          <form onSubmit={createAssignment}>
            <select
              value={assignmentCourseId}
              onChange={(event) =>
                setAssignmentCourseId(event.target.value)
              }
              required
            >
              <option value="">
                Select your course
              </option>

              {lecturerCourses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Assignment title"
              value={assignmentTitle}
              onChange={(event) =>
                setAssignmentTitle(event.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Assignment description"
              value={assignmentDescription}
              onChange={(event) =>
                setAssignmentDescription(
                  event.target.value
                )
              }
              required
            />

            <label>Due Date:</label>

            <input
              type="datetime-local"
              value={assignmentDueDate}
              onChange={(event) =>
                setAssignmentDueDate(event.target.value)
              }
              required
            />

            <input
              type="number"
              min="1"
              placeholder="Total marks"
              value={assignmentTotalMarks}
              onChange={(event) =>
                setAssignmentTotalMarks(
                  event.target.value
                )
              }
              required
            />

            <button type="submit">
              Create Assignment
            </button>
          </form>
        )}
      </div>

      {/* REAL STUDENT SUBMISSIONS */}
      <div className="submissions-section">
        <h2>Student Submissions</h2>

        {lecturerCourses.map((course) => (
          <div key={course.id}>
            <h3>{course.title}</h3>

            {!assignments[course.id] ||
            assignments[course.id].length === 0 ? (
              <p>No assignments for this course.</p>
            ) : (
              assignments[course.id].map(
                (assignment) => (
                  <div key={assignment.id}>
                    <h4>{assignment.title}</h4>

                    {!submissions[assignment.id] ||
                    submissions[assignment.id].length ===
                      0 ? (
                      <p>No submissions yet.</p>
                    ) : (
                      submissions[assignment.id].map(
                        (submission) => (
                          <div
                            className="submission-card"
                            key={submission.id}
                          >
                            <h4>
                              {submission.studentName}
                            </h4>

                            <p>
                              Status: {submission.status}
                            </p>

                            <p>
                              Submitted:{" "}
                              {new Date(
                                submission.submittedAt
                              ).toLocaleString()}
                            </p>

                            {submission.fileUrl && (
                              <p>
                                Submission:{" "}
                                {submission.fileUrl}
                              </p>
                            )}
                          </div>
                        )
                      )
                    )}
                  </div>
                )
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LecturerDashboard;