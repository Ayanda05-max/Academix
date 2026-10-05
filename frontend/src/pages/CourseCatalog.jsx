import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './CourseCatalog.css'

function CourseCatalog() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('course_code')

    if (error) {
      console.error('Error loading courses:', error)
      setError('Unable to load courses.')
    } else {
      setCourses(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="course-catalog">
        <h1>Course Catalog</h1>
        <p>Loading courses...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="course-catalog">
        <h1>Course Catalog</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="course-catalog">
      <h1>Course Catalog</h1>

      <p>Browse and explore available courses.</p>

      <div className="catalog-grid">
        {courses.map((course) => (
          <div className="catalog-card" key={course.id}>
            <h2>{course.department}</h2>

            <p>{course.title}</p>

            <p>{course.description}</p>

            <Link
              to={`/course/${course.course_code === 'CS101'
                ? 'computer-science'
                : course.course_code === 'IM101'
                ? 'information-management'
                : course.course_code === 'MATH101'
                ? 'mathematics'
                : 'software-engineering'
              }`}
              className="course-button"
            >
              View Course
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseCatalog