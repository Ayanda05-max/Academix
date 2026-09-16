import './CourseDetail.css'

function CourseDetail() {
  return (
    <div className="course-detail">
      <h1>Introduction to Programming</h1>

      <p className="course-code">Course Code: CS101</p>

      <section className="course-info">
        <h2>Course Overview</h2>

        <p>
          This course introduces students to the basic concepts of
          programming, problem solving and software development.
        </p>
      </section>

      <section className="course-info">
        <h2>Course Information</h2>

        <p><strong>Lecturer:</strong> Dr. John Smith</p>
        <p><strong>Credits:</strong> 12</p>
        <p><strong>Semester:</strong> Semester 1</p>
      </section>

      <section className="course-info">
        <h2>Course Materials</h2>

        <ul>
          <li>Introduction to Programming Notes</li>
          <li>Programming Exercises</li>
          <li>Lecture Slides</li>
        </ul>
      </section>

      <section className="course-info">
        <h2>Course Progress</h2>

        <p>Your current progress: 75%</p>

        <div className="progress-bar">
          <div className="progress" style={{ width: '75%' }}></div>
        </div>
      </section>
    </div>
  )
}

export default CourseDetail