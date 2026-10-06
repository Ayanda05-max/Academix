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



  const [courseName, setCourseName] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState("");



  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<"success" | "error">(

    "success"

  );



  useEffect(() => {

    async function loadData() {

      const token = localStorage.getItem("token");



      if (!token) {

        showMessage("You must log in first.", "error");

        setLoading(false);

        return;

      }



      try {

        const usersResponse = await fetch("/api/users", {

          method: "GET",

          headers: {

            Authorization: `Bearer ${token}`,

          },

        });



        if (usersResponse.ok) {

          const usersData: User[] = await usersResponse.json();

          setUsers(usersData);

        } else {

          showMessage("Could not load users.", "error");

        }



        const coursesResponse = await fetch("/api/courses", {

          method: "GET",

          headers: {

            Authorization: `Bearer ${token}`,

          },

        });



        if (coursesResponse.ok) {

          const coursesData: Course[] = await coursesResponse.json();



          setCourses(coursesData);



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

          showMessage("Could not load courses.", "error");

        }

      } catch (error) {

        showMessage("Could not connect to the server.", "error");

        console.error(error);

      } finally {

        setLoading(false);

      }

    }



    loadData();

  }, []);



  function showMessage(

    text: string,

    type: "success" | "error"

  ) {

    setMessage(text);

    setMessageType(type);

  }



  async function deleteUser(id: number) {

    const token = localStorage.getItem("token");



    if (!token) {

      showMessage("You must log in first.", "error");

      return;

    }



    const user = users.find((item) => item.id === id);



    const confirmed = window.confirm(

      `Are you sure you want to delete ${

        user ? `${user.firstName} ${user.lastName}` : "this user"

      }?`

    );



    if (!confirmed) {

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

        setUsers((currentUsers) =>

          currentUsers.filter((user) => user.id !== id)

        );



        setEnrollments((currentEnrollments) =>

          currentEnrollments.filter(

            (enrollment) => enrollment.studentId !== id

          )

        );



        showMessage("User deleted successfully.", "success");

      } else {

        showMessage("Could not delete user.", "error");

      }

    } catch (error) {

      showMessage("Could not connect to the server.", "error");

      console.error(error);

    }

  }



  async function addCourse(

    event: React.FormEvent<HTMLFormElement>

  ) {

    event.preventDefault();



    const token = localStorage.getItem("token");



    if (!token) {

      showMessage("You must log in first.", "error");

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



        setCourses((currentCourses) => [

          ...currentCourses,

          newCourse,

        ]);



        setCourseName("");



        showMessage("Course created successfully.", "success");

      } else {

        showMessage("Could not create course.", "error");

      }

    } catch (error) {

      showMessage("Could not connect to the server.", "error");

      console.error(error);

    }

  }



  async function deleteCourse(id: number) {

    const token = localStorage.getItem("token");



    if (!token) {

      showMessage("You must log in first.", "error");

      return;

    }



    const course = courses.find((item) => item.id === id);



    const confirmed = window.confirm(

      `Are you sure you want to delete ${

        course ? `"${course.title}"` : "this course"

      }?`

    );



    if (!confirmed) {

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

        setCourses((currentCourses) =>

          currentCourses.filter((course) => course.id !== id)

        );



        setEnrollments((currentEnrollments) =>

          currentEnrollments.filter(

            (enrollment) => enrollment.courseId !== id

          )

        );



        showMessage("Course deleted successfully.", "success");

      } else {

        showMessage("Could not delete course.", "error");

      }

    } catch (error) {

      showMessage("Could not connect to the server.", "error");

      console.error(error);

    }

  }



  async function addEnrollment(

    event: React.FormEvent<HTMLFormElement>

  ) {

    event.preventDefault();



    const token = localStorage.getItem("token");



    if (!token) {

      showMessage("You must log in first.", "error");

      return;

    }



    if (!selectedStudentId || !selectedCourseId) {

      showMessage(

        "Please select a student and a course.",

        "error"

      );

      return;

    }



    const studentId = selectedStudentId;



    try {

      const response = await fetch(

        `/api/enroll?studentId=${selectedStudentId}&courseId=${selectedCourseId}`,

        {

          method: "POST",

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );



      if (response.ok) {

        setSelectedStudentId("");

        setSelectedCourseId("");



        const enrollmentResponse = await fetch(

          `/api/enrollments/student/${studentId}`,

          {

            method: "GET",

            headers: {

              Authorization: `Bearer ${token}`,

            },

          }

        );



        if (enrollmentResponse.ok) {

          const studentEnrollments: Enrollment[] =

            await enrollmentResponse.json();



          setEnrollments((currentEnrollments) => {

            const otherEnrollments =

              currentEnrollments.filter(

                (enrollment) =>

                  enrollment.studentId !== Number(studentId)

              );



            return [

              ...otherEnrollments,

              ...studentEnrollments,

            ];

          });

        }



        showMessage(

          "Student enrolled successfully.",

          "success"

        );

      } else {

        const responseMessage = await response.text();



        showMessage(

          responseMessage ||

            "Could not enrol student.",

          "error"

        );

      }

    } catch (error) {

      showMessage("Could not connect to the server.", "error");

      console.error(error);

    }

  }



  async function deleteEnrollment(

    enrollment: Enrollment

  ) {

    const token = localStorage.getItem("token");



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

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );



      if (response.ok) {

        setEnrollments((currentEnrollments) =>

          currentEnrollments.filter(

            (item) => item.id !== enrollment.id

          )

        );



        showMessage(

          "Enrollment removed successfully.",

          "success"

        );

      } else {

        const responseMessage = await response.text();



        showMessage(

          responseMessage ||

            "Could not remove enrollment.",

          "error"

        );

      }

    } catch (error) {

      showMessage("Could not connect to the server.", "error");

      console.error(error);

    }

  }



  const students = users.filter(

    (user) => user.role === "STUDENT"

  );



  const lecturers = users.filter(

    (user) => user.role === "LECTURER"

  );



  const publishedCourses = courses.filter(

    (course) => course.status === "PUBLISHED"

  );



  const activeEnrollments = enrollments.filter(

    (enrollment) => enrollment.status === "ACTIVE"

  );



  async function copyUserInfo(user: User) {
    const userInfo = [
      `Name: ${user.firstName} ${user.lastName}`,
      `Email: ${user.email}`,
      `Role: ${formatRole(user.role)}`,
      `User ID: ${user.id}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(userInfo);
      showMessage(`${user.firstName} ${user.lastName}'s information copied.`, "success");
    } catch (error) {
      showMessage("Could not copy user information.", "error");
      console.error(error);
    }
  }

  function getInitials(user: User) {

    const firstInitial =

      user.firstName?.charAt(0).toUpperCase() || "";

    const lastInitial =

      user.lastName?.charAt(0).toUpperCase() || "";



    return `${firstInitial}${lastInitial}`;

  }



  function formatRole(role: string) {

    if (!role) {

      return "User";

    }



    return (

      role.charAt(0).toUpperCase() +

      role.slice(1).toLowerCase()

    );

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

    <div className="admin-panel">

      <header className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">

            ADMIN PORTAL

          </p>



          <h1>Admin Dashboard</h1>



          <p className="dashboard-description">

            Manage Academix users, courses and student

            enrolments from one central workspace.

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

            ×

          </button>

        </div>

      )}



      <div className="dashboard-cards admin-dashboard-cards">

        <div className="dashboard-card">

          <p className="dashboard-card-label">

            TOTAL USERS

          </p>



          <div className="dashboard-card-value">

            {users.length}

          </div>



          <p>

            {students.length} students · {lecturers.length} lecturers

          </p>

        </div>



        <div className="dashboard-card">

          <p className="dashboard-card-label">

            STUDENTS

          </p>



          <div className="dashboard-card-value">

            {students.length}

          </div>



          <p>Registered student accounts</p>

        </div>



        <div className="dashboard-card">

          <p className="dashboard-card-label">

            COURSES

          </p>



          <div className="dashboard-card-value">

            {courses.length}

          </div>



          <p>

            {publishedCourses.length} currently published

          </p>

        </div>



        <div className="dashboard-card">

          <p className="dashboard-card-label">

            ACTIVE ENROLMENTS

          </p>



          <div className="dashboard-card-value">

            {activeEnrollments.length}

          </div>



          <p>Current course enrolments</p>

        </div>

      </div>



      {loading ? (

        <div className="admin-loading">

          Loading administration data...

        </div>

      ) : (

        <>

          <section className="admin-section admin-modern-section">

            <div className="section-heading">

              <div>

                <p className="section-eyebrow">

                  USER MANAGEMENT

                </p>



                <h2>Users</h2>



                <p>

                  View registered accounts and their

                  assigned roles.

                </p>

              </div>



              <span className="section-count">

                {users.length}{" "}

                {users.length === 1 ? "user" : "users"}

              </span>

            </div>



            {users.length === 0 ? (

              <div className="dashboard-empty">

                <h3>No users found</h3>

                <p>

                  Registered Academix users will appear

                  here.

                </p>

              </div>

            ) : (

              <div className="admin-user-list">

                {users.map((user) => (

                  <article

                    className="admin-user-row"

                    key={user.id}

                  >

                    <div className="admin-user-main">

                      <div className="user-avatar">

                        {getInitials(user)}

                      </div>



                      <div className="admin-user-details">

                        <div className="admin-user-name-row">

                          <h3>

                            {user.firstName}{" "}

                            {user.lastName}

                          </h3>



                          <span

                            className={`role-badge role-${user.role.toLowerCase()}`}

                          >

                            {formatRole(user.role)}

                          </span>

                        </div>



                        <p>{user.email}</p>

                      </div>

                    </div>



                    <div className="admin-row-actions">

                      <span className="record-id">

                        ID #{user.id}

                      </span>



                      <button
                        type="button"
                        className="copy-outline-button"
                        onClick={() => copyUserInfo(user)}
                      >
                        Copy Info
                      </button>

                      <button

                        type="button"

                        className="danger-outline-button"

                        onClick={() =>

                          deleteUser(user.id)

                        }

                      >

                        Delete

                      </button>

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>



          <section className="admin-section admin-modern-section">

            <div className="section-heading">

              <div>

                <p className="section-eyebrow">

                  COURSE MANAGEMENT

                </p>



                <h2>Courses</h2>



                <p>

                  Create courses and manage existing

                  course records.

                </p>

              </div>



              <span className="section-count">

                {courses.length}{" "}

                {courses.length === 1

                  ? "course"

                  : "courses"}

              </span>

            </div>



            <div className="admin-action-panel">

              <div className="admin-action-copy">

                <h3>Create a course</h3>

                <p>

                  Add a new course record to Academix.

                  Course content can be managed afterwards.

                </p>

              </div>



              <form

                className="admin-inline-form"

                onSubmit={addCourse}

              >

                <div className="dashboard-form-field">

                  <label htmlFor="course-name">

                    Course name

                  </label>



                  <input

                    id="course-name"

                    type="text"

                    placeholder="e.g. Applied Mathematics"

                    value={courseName}

                    onChange={(event) =>

                      setCourseName(event.target.value)

                    }

                    required

                  />

                </div>



                <button type="submit">

                  Add Course

                </button>

              </form>

            </div>



            {courses.length === 0 ? (

              <div className="dashboard-empty">

                <h3>No courses found</h3>

                <p>

                  Create the first course using the form

                  above.

                </p>

              </div>

            ) : (

              <div className="admin-course-grid">

                {courses.map((course) => (

                  <article

                    className="admin-course-card"

                    key={course.id}

                  >

                    <div className="admin-course-header">

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



                    <p className="admin-course-description">

                      {course.description ||

                        "No course description has been added yet."}

                    </p>



                    <div className="admin-course-meta">

                      <div>

                        <span>Instructor</span>

                        <strong>

                          {course.instructorName ||

                            "Not assigned"}

                        </strong>

                      </div>



                      <div>

                        <span>Course ID</span>

                        <strong>#{course.id}</strong>

                      </div>

                    </div>



                    <div className="admin-course-footer">

                      <button

                        type="button"

                        className="danger-outline-button"

                        onClick={() =>

                          deleteCourse(course.id)

                        }

                      >

                        Delete Course

                      </button>

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>



          <section className="admin-section admin-modern-section">

            <div className="section-heading">

              <div>

                <p className="section-eyebrow">

                  ENROLMENT MANAGEMENT

                </p>



                <h2>Student Enrolments</h2>



                <p>

                  Assign registered students to published

                  courses and manage existing enrolments.

                </p>

              </div>



              <span className="section-count">

                {enrollments.length}{" "}

                {enrollments.length === 1

                  ? "enrolment"

                  : "enrolments"}

              </span>

            </div>



            <div className="admin-action-panel">

              <div className="admin-action-copy">

                <h3>Enrol a student</h3>

                <p>

                  Students can only be enrolled into

                  courses that have been published.

                </p>

              </div>



              <form

                className="admin-enrollment-form"

                onSubmit={addEnrollment}

              >

                <div className="dashboard-form-field">

                  <label htmlFor="student-select">

                    Student

                  </label>



                  <select

                    id="student-select"

                    value={selectedStudentId}

                    onChange={(event) =>

                      setSelectedStudentId(

                        event.target.value

                      )

                    }

                    required

                  >

                    <option value="">

                      Select student

                    </option>



                    {students.map((student) => (

                      <option

                        key={student.id}

                        value={student.id}

                      >

                        {student.firstName}{" "}

                        {student.lastName}

                      </option>

                    ))}

                  </select>

                </div>



                <div className="dashboard-form-field">

                  <label htmlFor="course-select">

                    Published course

                  </label>



                  <select

                    id="course-select"

                    value={selectedCourseId}

                    onChange={(event) =>

                      setSelectedCourseId(

                        event.target.value

                      )

                    }

                    required

                  >

                    <option value="">

                      Select course

                    </option>



                    {publishedCourses.map((course) => (

                      <option

                        key={course.id}

                        value={course.id}

                      >

                        {course.title}

                      </option>

                    ))}

                  </select>

                </div>



                <button type="submit">

                  Enrol Student

                </button>

              </form>

            </div>



            {enrollments.length === 0 ? (

              <div className="dashboard-empty">

                <h3>No enrolments found</h3>

                <p>

                  Student course enrolments will appear

                  here.

                </p>

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

                        <span className="sr-only">

                          Actions

                        </span>

                      </th>

                    </tr>

                  </thead>



                  <tbody>

                    {enrollments.map((enrollment) => (

                      <tr key={enrollment.id}>

                        <td>

                          <div className="table-student">

                            <strong>

                              {enrollment.studentName}

                            </strong>

                            <span>

                              {enrollment.studentEmail}

                            </span>

                          </div>

                        </td>



                        <td>

                          {enrollment.courseTitle}

                        </td>



                        <td>

                          <span

                            className={`status-badge ${

                              enrollment.status ===

                              "ACTIVE"

                                ? "status-published"

                                : "status-draft"

                            }`}

                          >

                            {enrollment.status}

                          </span>

                        </td>



                        <td>

                          {formatDate(

                            enrollment.enrolledAt

                          )}

                        </td>



                        <td className="table-action-cell">

                          <button

                            type="button"

                            className="danger-outline-button"

                            onClick={() =>

                              deleteEnrollment(

                                enrollment

                              )

                            }

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

        </>

      )}

    </div>

  );

}



export default AdminPanel;
