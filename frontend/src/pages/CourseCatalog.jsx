import { Link } from 'react-router-dom'
import './CourseCatalog.css'

function CourseCatalog() {
  return (
    <div className="course-catalog">
      <h1>Course Catalog</h1>

      <p>Browse and explore available courses.</p>

      <div className="catalog-grid">

        <div className="catalog-card">
          <h2>Computer Science</h2>

          <p>Introduction to Programming</p>

          <p>
            Learn the fundamentals of programming and problem solving.
          </p>

          <Link
            to="/course/computer-science"
            className="course-button"
          >
            View Course
          </Link>
        </div>

        <div className="catalog-card">
          <h2>Information Management</h2>

          <p>Database Systems</p>

          <p>
            Learn about databases, data management and information systems.
          </p>

          <Link
            to="/course/information-management"
            className="course-button"
          >
            View Course
          </Link>
        </div>

        <div className="catalog-card">
          <h2>Mathematics</h2>

          <p>Discrete Mathematics</p>

          <p>
            Study logic, sets, graphs and mathematical structures.
          </p>

          <Link
            to="/course/mathematics"
            className="course-button"
          >
            View Course
          </Link>
        </div>

        <div className="catalog-card">
          <h2>Software Engineering</h2>

          <p>Software Development</p>

          <p>
            Learn software development methods and engineering practices.
          </p>

          <Link
            to="/course/software-engineering"
            className="course-button"
          >
            View Course
          </Link>
        </div>

      </div>
    </div>
  )
}

export default CourseCatalog

