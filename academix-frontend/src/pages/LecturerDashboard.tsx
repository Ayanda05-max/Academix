import { readError } from '../utils/readError';
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



  const [

    assignmentDescription,

    setAssignmentDescription,

  ] = useState<string>("");



  const [assignmentDueDate, setAssignmentDueDate] =

    useState<string>("");



  const [

    assignmentTotalMarks,

    setAssignmentTotalMarks,

  ] = useState<string>("");



  const lecturerId = Number(

    localStorage.getItem("userId")

  );



  const lecturerCourses = courses.filter(

    (course) => course.instructorId === lecturerId

  );



  // Dashboard statistics
  const totalAssignments = lecturerCourses.reduce(

    (total, course) =>

      total + (assignments[course.id]?.length || 0),

    0

  );



  const totalSubmissions = lecturerCourses.reduce(

    (total, course) => {

      const courseAssignments =

        assignments[course.id] || [];



      return (

        total +

        courseAssignments.reduce(

          (assignmentTotal, assignment) =>

            assignmentTotal +

            (submissions[assignment.id]?.length || 0),

          0

        )

      );

    },

    0

  );



  const pendingSubmissions = lecturerCourses.reduce(

    (total, course) => {

      const courseAssignments =

        assignments[course.id] || [];



      return (

        total +

        courseAssignments.reduce(

          (assignmentTotal, assignment) =>

            assignmentTotal +

            (submissions[assignment.id] || []).filter(

              (submission) =>

                submission.status !== "GRADED"

            ).length,

          0

        )

      );

    },

    0

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



  // Load saved grades
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
        const message = await readError(response);



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



  async function copySubmissionInfo(
    submission: Submission,
    assignment: Assignment
  ) {
    const savedGrade = grades[submission.id];

    const submissionInfo = [
      `Student: ${submission.studentName}`,
      `Assignment: ${assignment.title}`,
      `Submission: ${submission.fileUrl}`,
      `Status: ${submission.status}`,
      savedGrade
        ? `Grade: ${savedGrade.marksAwarded}/${savedGrade.totalMarks}`
        : "Grade: Not graded yet",
      savedGrade?.feedback
        ? `Feedback: ${savedGrade.feedback}`
        : "Feedback: No feedback yet",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(submissionInfo);
      alert("Submission information copied.");
    } catch (error) {
      alert("Could not copy submission information.");
      console.error(error);
    }
  }

  return (

    <div className="lecturer-dashboard">

      {/* HEADER */}



      <div className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">

            LECTURER PORTAL

          </p>



          <h1>Lecturer Dashboard</h1>



          <p className="dashboard-description">

            Manage your courses, learning content,

            assignments and student submissions.

          </p>

        </div>

      </div>



      {/* OVERVIEW */}



      <div className="dashboard-cards">

        <div className="dashboard-card">

          <p className="dashboard-card-label">

            MY COURSES

          </p>



          <div className="dashboard-card-value">

            {lecturerCourses.length}

          </div>



          <p>Courses assigned to you</p>

        </div>



        <div className="dashboard-card">

          <p className="dashboard-card-label">

            ASSIGNMENTS

          </p>



          <div className="dashboard-card-value">

            {totalAssignments}

          </div>



          <p>Across your courses</p>

        </div>



        <div className="dashboard-card">

          <p className="dashboard-card-label">

            SUBMISSIONS

          </p>



          <div className="dashboard-card-value">

            {totalSubmissions}

          </div>



          <p>Student submissions received</p>

        </div>



        <div className="dashboard-card">

          <p className="dashboard-card-label">

            PENDING GRADING

          </p>



          <div className="dashboard-card-value">

            {pendingSubmissions}

          </div>



          <p>Waiting for grading</p>

        </div>

      </div>



      {/* MANAGE COURSES */}



      <section className="courses-section">

        <div className="section-heading">

          <div>

            <p className="section-eyebrow">

              COURSE MANAGEMENT

            </p>

            <h2>My Courses</h2>

            <p>

              Create and manage the courses assigned

              to you.

            </p>

          </div>

        </div>



        <form onSubmit={addCourse}>

          <div className="dashboard-form-field">

            <label>Course name</label>

            <input

              type="text"

              placeholder="e.g. Java Programming"

              value={courseName}

              onChange={(event) =>

                setCourseName(event.target.value)

              }

              required

            />

          </div>



          <div className="dashboard-form-field">

            <label>Category</label>

            <input

              type="text"

              placeholder="e.g. Computer Science"

              value={courseCategory}

              onChange={(event) =>

                setCourseCategory(event.target.value)

              }

            />

          </div>



          <div className="dashboard-form-field dashboard-form-wide">

            <label>Description</label>

            <input

              type="text"

              placeholder="Brief course description"

              value={courseDescription}

              onChange={(event) =>

                setCourseDescription(

                  event.target.value

                )

              }

            />

          </div>



          <div className="dashboard-form-actions">

            <button type="submit">

              Create Course

            </button>

          </div>

        </form>



        {courseError && (

          <div className="dashboard-error">

            {courseError}

          </div>

        )}



        {lecturerCourses.length === 0 &&

          !courseError && (

            <div className="dashboard-empty">

              <h3>No courses yet</h3>

              <p>

                Create your first course using the

                form above.

              </p>

            </div>

          )}



        <div className="course-grid">

          {lecturerCourses.map((course) => (

            <article

              className="course-card"

              key={course.id}

            >

              <div className="course-card-header">

                <div>

                  <p className="course-category">

                    {course.category ||

                      "Uncategorised"}

                  </p>



                  <h3>{course.title}</h3>

                </div>



                <span

                  className={`status-badge ${

                    course.status === "PUBLISHED"

                      ? "status-published"

                      : "status-draft"

                  }`}

                >

                  {course.status}

                </span>

              </div>



              <p className="course-description">

                {course.description ||

                  "No course description provided."}

              </p>



              <div className="course-meta">

                <span>

                  <strong>Instructor:</strong>{" "}

                  {course.instructorName ||

                    "Not assigned"}

                </span>



                <span>

                  <strong>Lessons:</strong>{" "}

                  {lessons[course.id]?.length || 0}

                </span>



                <span>

                  <strong>Assignments:</strong>{" "}

                  {assignments[course.id]?.length ||

                    0}

                </span>

              </div>



              {course.status === "DRAFT" && (

                <div className="course-actions">

                  <button

                    type="button"

                    onClick={() =>

                      publishCourse(course.id)

                    }

                  >

                    Publish Course

                  </button>

                </div>

              )}



              <div className="course-content-block">

                <h4>Lessons</h4>



                {!lessons[course.id] ||

                lessons[course.id].length === 0 ? (

                  <p className="muted-text">

                    No lessons added yet.

                  </p>

                ) : (

                  <div className="compact-list">

                    {lessons[course.id].map(

                      (lesson, index) => (

                        <div

                          className="compact-list-item"

                          key={lesson.id}

                        >

                          <span className="list-number">

                            {index + 1}

                          </span>



                          <div>

                            <strong>

                              {lesson.title}

                            </strong>



                            {lesson.description && (

                              <p>

                                {lesson.description}

                              </p>

                            )}

                          </div>

                        </div>

                      )

                    )}

                  </div>

                )}

              </div>



              <div className="course-content-block">

                <h4>Assignments</h4>



                {!assignments[course.id] ||

                assignments[course.id].length ===

                  0 ? (

                  <p className="muted-text">

                    No assignments created yet.

                  </p>

                ) : (

                  <div className="compact-list">

                    {assignments[course.id].map(

                      (assignment) => (

                        <div

                          className="assignment-summary"

                          key={assignment.id}

                        >

                          <div className="assignment-summary-header">

                            <strong>

                              {assignment.title}

                            </strong>



                            <span>

                              {assignment.totalMarks}{" "}

                              marks

                            </span>

                          </div>



                          <p>

                            {assignment.description}

                          </p>



                          <small>

                            Due{" "}

                            {new Date(

                              assignment.dueDate

                            ).toLocaleString()}

                          </small>

                        </div>

                      )

                    )}

                  </div>

                )}

              </div>

            </article>

          ))}

        </div>

      </section>



      {/* ADD LESSON */}



      <section className="lessons-section">

        <div className="section-heading">

          <div>

            <p className="section-eyebrow">

              LEARNING CONTENT

            </p>

            <h2>Add Lesson</h2>

            <p>

              Add learning material to one of your

              courses.

            </p>

          </div>

        </div>



        {lecturerCourses.length === 0 ? (

          <div className="dashboard-empty">

            <p>

              You need a course before you can add

              lessons.

            </p>

          </div>

        ) : (

          <form onSubmit={addLesson}>

            <div className="dashboard-form-field">

              <label>Course</label>



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

            </div>



            <div className="dashboard-form-field">

              <label>Lesson title</label>



              <input

                type="text"

                placeholder="Enter lesson title"

                value={lessonTitle}

                onChange={(event) =>

                  setLessonTitle(

                    event.target.value

                  )

                }

                required

              />

            </div>



            <div className="dashboard-form-field dashboard-form-wide">

              <label>Lesson description</label>



              <input

                type="text"

                placeholder="Brief lesson description"

                value={lessonDescription}

                onChange={(event) =>

                  setLessonDescription(

                    event.target.value

                  )

                }

              />

            </div>



            <div className="dashboard-form-actions">

              <button type="submit">

                Add Lesson

              </button>

            </div>

          </form>

        )}

      </section>



      {/* CREATE ASSIGNMENT */}



      <section className="assignments-section">

        <div className="section-heading">

          <div>

            <p className="section-eyebrow">

              ASSESSMENTS

            </p>



            <h2>Create Assignment</h2>



            <p>

              Create an assessment for one of your

              courses.

            </p>

          </div>

        </div>



        {lecturerCourses.length === 0 ? (

          <div className="dashboard-empty">

            <p>

              You need a course before you can

              create assignments.

            </p>

          </div>

        ) : (

          <form onSubmit={createAssignment}>

            <div className="dashboard-form-field">

              <label>Course</label>



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

            </div>



            <div className="dashboard-form-field">

              <label>Assignment title</label>



              <input

                type="text"

                placeholder="Enter assignment title"

                value={assignmentTitle}

                onChange={(event) =>

                  setAssignmentTitle(

                    event.target.value

                  )

                }

                required

              />

            </div>



            <div className="dashboard-form-field dashboard-form-wide">

              <label>Description</label>



              <input

                type="text"

                placeholder="Assignment instructions"

                value={assignmentDescription}

                onChange={(event) =>

                  setAssignmentDescription(

                    event.target.value

                  )

                }

                required

              />

            </div>



            <div className="dashboard-form-field">

              <label>Due date</label>



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

            </div>



            <div className="dashboard-form-field">

              <label>Total marks</label>



              <input

                type="number"

                min="1"

                placeholder="e.g. 100"

                value={assignmentTotalMarks}

                onChange={(event) =>

                  setAssignmentTotalMarks(

                    event.target.value

                  )

                }

                required

              />

            </div>



            <div className="dashboard-form-actions">

              <button type="submit">

                Create Assignment

              </button>

            </div>

          </form>

        )}

      </section>



      {/* STUDENT SUBMISSIONS */}



      <section className="submissions-section">

        <div className="section-heading">

          <div>

            <p className="section-eyebrow">

              ASSESSMENT MANAGEMENT

            </p>



            <h2>Student Submissions</h2>



            <p>

              Review submitted work and record

              student grades.

            </p>

          </div>

        </div>



        {lecturerCourses.length === 0 ? (

          <div className="dashboard-empty">

            <p>No lecturer courses available.</p>

          </div>

        ) : (

          lecturerCourses.map((course) => (

            <div

              className="submission-course"

              key={course.id}

            >

              <div className="submission-course-header">

                <h3>{course.title}</h3>



                <span>

                  {assignments[course.id]?.length ||

                    0}{" "}

                  assignment(s)

                </span>

              </div>



              {!assignments[course.id] ||

              assignments[course.id].length ===

                0 ? (

                <p className="muted-text">

                  No assignments for this course.

                </p>

              ) : (

                assignments[course.id].map(

                  (assignment) => (

                    <div

                      className="submission-assignment"

                      key={assignment.id}

                    >

                      <div className="submission-assignment-header">

                        <div>

                          <h4>

                            {assignment.title}

                          </h4>



                          <p>

                            {assignment.totalMarks}{" "}

                            total marks

                          </p>

                        </div>

                      </div>



                      {!submissions[

                        assignment.id

                      ] ||

                      submissions[assignment.id]

                        .length === 0 ? (

                        <div className="dashboard-empty compact-empty">

                          <p>

                            No submissions yet.

                          </p>

                        </div>

                      ) : (

                        submissions[

                          assignment.id

                        ].map((submission) => {

                          const savedGrade =

                            grades[submission.id];



                          return (

                            <article

                              className="submission-card"

                              key={submission.id}

                            >

                              <div className="submission-card-header">

                                <div>

                                  <h4>

                                    {

                                      submission.studentName

                                    }

                                  </h4>



                                  <p>

                                    Submitted{" "}

                                    {new Date(

                                      submission.submittedAt

                                    ).toLocaleString()}

                                  </p>

                                </div>



                                <span

                                  className={`status-badge ${

                                    submission.status ===

                                    "GRADED"

                                      ? "status-graded"

                                      : "status-submitted"

                                  }`}

                                >

                                  {

                                    submission.status

                                  }

                                </span>

                              </div>



                              {submission.fileUrl && (
                                <>

                                <div className="submission-copy-row">
                                  <button
                                    type="button"
                                    className="copy-outline-button"
                                    onClick={() =>
                                      copySubmissionInfo(
                                        submission,
                                        assignment
                                      )
                                    }
                                  >
                                    Copy Submission Info
                                  </button>
                                </div>

                                <div className="submission-file">

                                  <span>

                                    Submission file

                                  </span>



                                  <a

                                    href={

                                      submission.fileUrl

                                    }

                                    target="_blank"

                                    rel="noreferrer"

                                  >

                                    Open submission

                                  </a>

                                </div>

                                </>
                              )}



                              {savedGrade ? (

                                <div className="grade-result">

                                  <div className="grade-result-header">

                                    <h5>

                                      Grade Result

                                    </h5>



                                    <strong>

                                      {

                                        savedGrade.marksAwarded

                                      }{" "}

                                      /{" "}

                                      {

                                        savedGrade.totalMarks

                                      }

                                    </strong>

                                  </div>



                                  <p>

                                    <strong>

                                      Feedback:

                                    </strong>{" "}

                                    {savedGrade.feedback ||

                                      "No feedback provided."}

                                  </p>



                                  <p className="grade-date">

                                    Graded{" "}

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



                                  <div className="grading-fields">

                                    <div className="dashboard-form-field">

                                      <label>

                                        Marks

                                      </label>



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

                                        onChange={(

                                          event

                                        ) =>

                                          setGradeMarks(

                                            (

                                              current

                                            ) => ({

                                              ...current,

                                              [submission.id]:

                                                event

                                                  .target

                                                  .value,

                                            })

                                          )

                                        }

                                      />

                                    </div>



                                    <div className="dashboard-form-field">

                                      <label>

                                        Feedback

                                      </label>



                                      <input

                                        type="text"

                                        placeholder="Feedback for student"

                                        value={

                                          gradeFeedback[

                                            submission.id

                                          ] || ""

                                        }

                                        onChange={(

                                          event

                                        ) =>

                                          setGradeFeedback(

                                            (

                                              current

                                            ) => ({

                                              ...current,

                                              [submission.id]:

                                                event

                                                  .target

                                                  .value,

                                            })

                                          )

                                        }

                                      />

                                    </div>

                                  </div>



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

                                    Save Grade

                                  </button>

                                </div>

                              ) : (

                                <p className="muted-text">

                                  Grade information is

                                  loading.

                                </p>

                              )}

                            </article>

                          );

                        })

                      )}

                    </div>

                  )

                )

              )}

            </div>

          ))

        )}

      </section>

    </div>

  );

}

export default LecturerDashboard;
