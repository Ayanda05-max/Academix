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

type Grade = {
  id: number;
  submissionId: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  courseId: number;
  totalMarks: number;
  marksAwarded: number;
  feedback: string;
  gradedAt: string;
};

function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);

  const [lessons, setLessons] =
    useState<Record<number, Lesson[]>>({});

  const [assignments, setAssignments] =
    useState<Record<number, Assignment[]>>({});

  const [submissions, setSubmissions] =
    useState<Record<number, Submission[]>>({});

  // Grades are stored using the submission ID as the key
  const [grades, setGrades] =
    useState<Record<number, Grade>>({});

  const [gradeMarks, setGradeMarks] =
    useState<Record<number, string>>({});

  const [gradeFeedback, setGradeFeedback] =
    useState<Record<number, string>>({});

  const [courseError, setCourseError] =
    useState<string>("");

  // Course form
  const [courseName, setCourseName] =
    useState<string>("");

  const [courseCategory, setCourseCategory] =
    useState<string>("");

  const [courseDescription, setCourseDescription] =
    useState<string>("");

  // Lesson form
  const [selectedCourseId, setSelectedCourseId] =
    useState<string>("");

  const [lessonTitle, setLessonTitle] =
    useState<string>("");

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

  const lecturerId = Number(
    localStorage.getItem("userId")
  );

  const lecturerCourses = courses.filter(
    (course) => course.instructorId === lecturerId
  );

  useEffect(() => {
    loadCourses();
  }, []);

  // Load courses
  async function loadCourses() {
    const token = localStorage.getItem("token");

    if (!token) {
      setCourseError(
        "You must be logged in to view courses."
      );
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

        for (const course of data) {
          if (course.instructorId === lecturerId) {
            await loadLessons(course.id);
            await loadAssignments(course.id);
            await loadGrades(course.id);
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

        setLessons((current) => ({
          ...current,
          [courseId]: data,
        }));
      }
    } catch (error) {
      console.error(
        "Could not load lessons:",
        error
      );
    }
  }

  // Load assignments
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
        const data: Assignment[] =
          await response.json();

        setAssignments((current) => ({
          ...current,
          [courseId]: data,
        }));

        for (const assignment of data) {
          await loadSubmissions(assignment.id);
        }
      }
    } catch (error) {
      console.error(
        "Could not load assignments:",
        error
      );
    }
  }

  // Load submissions
  async function loadSubmissions(
    assignmentId: number
  ) {
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
        const data: Submission[] =
          await response.json();

        setSubmissions((current) => ({
          ...current,
          [assignmentId]: data,
        }));
      }
    } catch (error) {
      console.error(
        "Could not load submissions:",
        error
      );
    }
  }

  // Load saved grades for a course
  async function loadGrades(courseId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `/api/grades/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: Grade[] = await response.json();

        setGrades((current) => {
          const updated = { ...current };

          for (const grade of data) {
            updated[grade.submissionId] = grade;
          }

          return updated;
        });
      }
    } catch (error) {
      console.error(
        "Could not load grades:",
        error
      );
    }
  }

  // Add course
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
        const newCourse: Course =
          await response.json();

        setCourses((current) => [
          ...current,
          newCourse,
        ]);

        setCourseName("");
        setCourseCategory("");
        setCourseDescription("");

        alert("Course created successfully");
      } else {
        const message = await response.text();

        alert(
          "Could not create course: " + message
        );
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Add lesson
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
        const newLesson: Lesson =
          await response.json();

        const courseId = Number(selectedCourseId);

        setLessons((current) => ({
          ...current,
          [courseId]: [
            ...(current[courseId] || []),
            newLesson,
          ],
        }));

        setLessonTitle("");
        setLessonDescription("");

        alert(
          `Lesson "${newLesson.title}" added successfully`
        );
      } else {
        const message = await response.text();

        alert(
          "Could not add lesson: " + message
        );
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Publish course
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
        const updatedCourse: Course =
          await response.json();

        setCourses((current) =>
          current.map((course) =>
            course.id === courseId
              ? updatedCourse
              : course
          )
        );

        alert("Course published successfully");
      } else {
        const message = await response.text();

        alert(
          "Could not publish course: " + message
        );
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Create assignment
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
      alert(
        "Total marks must be greater than 0."
      );
      return;
    }

    try {
      const response = await fetch(
        "/api/assignments",
        {
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
            totalMarks: Number(
              assignmentTotalMarks
            ),
          }),
        }
      );

      if (response.ok) {
        const newAssignment: Assignment =
          await response.json();

        const courseId = Number(
          assignmentCourseId
        );

        setAssignments((current) => ({
          ...current,
          [courseId]: [
            ...(current[courseId] || []),
            newAssignment,
          ],
        }));

        setSubmissions((current) => ({
          ...current,
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

        alert(
          "Could not create assignment: " +
            message
        );
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  // Grade submission
  async function gradeSubmission(
    submissionId: number,
    assignmentId: number,
    courseId: number,
    totalMarks: number
  ) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in.");
      return;
    }

    const marksText = gradeMarks[submissionId];

    if (
      marksText === undefined ||
      marksText === ""
    ) {
      alert("Please enter marks.");
      return;
    }

    const marks = Number(marksText);

    if (
      Number.isNaN(marks) ||
      marks < 0 ||
      marks > totalMarks
    ) {
      alert(
        `Marks must be between 0 and ${totalMarks}.`
      );
      return;
    }

    try {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submissionId,
          marksAwarded: marks,
          feedback:
            gradeFeedback[submissionId] || "",
        }),
      });

      if (response.ok) {
        alert("Submission graded successfully");

        await loadSubmissions(assignmentId);
        await loadGrades(courseId);

        setGradeMarks((current) => ({
          ...current,
          [submissionId]: "",
        }));

        setGradeFeedback((current) => ({
          ...current,
          [submissionId]: "",
        }));
      } else {
        const message = await response.text();

        alert(
          "Could not grade submission: " +
            message
        );
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  return (
    <div className="lecturer-dashboard">
      <h1>Lecturer Dashboard</h1>

      <p>
        Manage courses, assignments, submissions
        and student grades.
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Manage Courses</h3>
          <p>
            View and manage the courses you are
            teaching.
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Assignments</h3>
          <p>
            Create assignments for your courses.
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Submissions</h3>
          <p>
            View and grade student submissions.
          </p>
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
              setCourseDescription(
                event.target.value
              )
            }
          />

          <button type="submit">
            Add Course
          </button>
        </form>

        {courseError && <p>{courseError}</p>}

        {courses.length === 0 &&
          !courseError && (
            <p>No courses available.</p>
          )}

        {courses.map((course) => (
          <div
            className="course-card"
            key={course.id}
          >
            <h3>{course.title}</h3>

            <p>
              Category:{" "}
              {course.category || "Not specified"}
            </p>

            <p>Status: {course.status}</p>

            <p>
              Instructor:{" "}
              {course.instructorName ||
                "Not assigned"}
            </p>

            {course.description && (
              <p>
                Description: {course.description}
              </p>
            )}

            {course.instructorId === lecturerId &&
              course.status === "DRAFT" && (
                <button
                  onClick={() =>
                    publishCourse(course.id)
                  }
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
                          {index + 1}.{" "}
                          {lesson.title}
                        </p>

                        {lesson.description && (
                          <p>
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    )
                  )
                )}

                <h4>Assignments</h4>

                {!assignments[course.id] ||
                assignments[course.id].length ===
                  0 ? (
                  <p>
                    No assignments created yet.
                  </p>
                ) : (
                  assignments[course.id].map(
                    (assignment) => (
                      <div key={assignment.id}>
                        <p>
                          <strong>
                            {assignment.title}
                          </strong>
                        </p>

                        <p>
                          {assignment.description}
                        </p>

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
            You do not have any courses to add
            lessons to.
          </p>
        ) : (
          <form onSubmit={addLesson}>
            <select
              value={selectedCourseId}
              onChange={(event) =>
                setSelectedCourseId(
                  event.target.value
                )
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
                setLessonDescription(
                  event.target.value
                )
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
            You do not have any courses to create
            assignments for.
          </p>
        ) : (
          <form onSubmit={createAssignment}>
            <select
              value={assignmentCourseId}
              onChange={(event) =>
                setAssignmentCourseId(
                  event.target.value
                )
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
                setAssignmentTitle(
                  event.target.value
                )
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
                setAssignmentDueDate(
                  event.target.value
                )
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

      {/* STUDENT SUBMISSIONS */}
      <div className="submissions-section">
        <h2>Student Submissions</h2>

        {lecturerCourses.map((course) => (
          <div key={course.id}>
            <h3>{course.title}</h3>

            {!assignments[course.id] ||
            assignments[course.id].length ===
              0 ? (
              <p>
                No assignments for this course.
              </p>
            ) : (
              assignments[course.id].map(
                (assignment) => (
                  <div key={assignment.id}>
                    <h4>{assignment.title}</h4>

                    {!submissions[assignment.id] ||
                    submissions[assignment.id]
                      .length === 0 ? (
                      <p>No submissions yet.</p>
                    ) : (
                      submissions[
                        assignment.id
                      ].map((submission) => {
                        const savedGrade =
                          grades[submission.id];

                        return (
                          <div
                            className="submission-card"
                            key={submission.id}
                          >
                            <h4>
                              {
                                submission.studentName
                              }
                            </h4>

                            <p>
                              Status:{" "}
                              {submission.status}
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
                                <a
                                  href={
                                    submission.fileUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {
                                    submission.fileUrl
                                  }
                                </a>
                              </p>
                            )}

                            {savedGrade ? (
                              <div className="grade-result">
                                <h5>
                                  Grade Result
                                </h5>

                                <p>
                                  Grade:{" "}
                                  <strong>
                                    {
                                      savedGrade.marksAwarded
                                    }{" "}
                                    /{" "}
                                    {
                                      savedGrade.totalMarks
                                    }
                                  </strong>
                                </p>

                                <p>
                                  Feedback:{" "}
                                  {savedGrade.feedback ||
                                    "No feedback provided."}
                                </p>

                                <p>
                                  Graded:{" "}
                                  {new Date(
                                    savedGrade.gradedAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                            ) : submission.status !==
                              "GRADED" ? (
                              <div className="grading-section">
                                <h5>
                                  Grade Submission
                                </h5>

                                <input
                                  type="number"
                                  min="0"
                                  max={
                                    assignment.totalMarks
                                  }
                                  placeholder={`Marks out of ${assignment.totalMarks}`}
                                  value={
                                    gradeMarks[
                                      submission.id
                                    ] || ""
                                  }
                                  onChange={(event) =>
                                    setGradeMarks(
                                      (current) => ({
                                        ...current,
                                        [submission.id]:
                                          event.target
                                            .value,
                                      })
                                    )
                                  }
                                />

                                <input
                                  type="text"
                                  placeholder="Feedback"
                                  value={
                                    gradeFeedback[
                                      submission.id
                                    ] || ""
                                  }
                                  onChange={(event) =>
                                    setGradeFeedback(
                                      (current) => ({
                                        ...current,
                                        [submission.id]:
                                          event.target
                                            .value,
                                      })
                                    )
                                  }
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    gradeSubmission(
                                      submission.id,
                                      assignment.id,
                                      course.id,
                                      assignment.totalMarks
                                    )
                                  }
                                >
                                  Grade Submission
                                </button>
                              </div>
                            ) : (
                              <p>
                                Grade information is
                                loading.
                              </p>
                            )}
                          </div>
                        );
                      })
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