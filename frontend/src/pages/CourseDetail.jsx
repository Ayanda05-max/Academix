import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './CourseDetail.css'

function CourseDetail() {
  const { courseId } = useParams()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  async function fetchCourse() {
    let courseCode

    if (courseId === 'computer-science') {
      courseCode = 'CS101'
    } else if (courseId === 'information-management') {
      courseCode = 'IM101'
    } else if (courseId === 'mathematics') {
      courseCode = 'MATH101'
    } else if (courseId === 'software-engineering') {
      courseCode = 'SE101'
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('course_code', courseCode)
      .single()

    if (error) {
      console.error('Error loading course:', error)
      setError('Unable to load course.')
    } else {
      setCourse(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="course-detail">
        <h1>Loading course...</h1>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="course-detail">
        <h1>Course Not Found</h1>
        <p>{error || 'The requested course could not be found.'}</p>
      </div>
    )
  }

  return (
    <div className="course-detail">
      <h1>{course.title}</h1>

      <p className="course-code">
        Course Code: {course.course_code}
      </p>

      <section className="course-info">
        <h2>Course Overview</h2>

        <p>{course.description}</p>
      </section>

      <section className="course-info">
        <h2>Course Information</h2>

        <p>
          <strong>Department:</strong> {course.department}
        </p>

        <p>
          <strong>Lecturer:</strong> {course.lecturer}
        </p>

        <p>
          <strong>Credits:</strong> {course.credits}
        </p>

        <p>
          <strong>Semester:</strong> {course.semester}
        </p>
      </section>

      <section className="course-info">
        <h2>Course Materials</h2>

        <ul>
          <li>Course Notes</li>
          <li>Course Exercises</li>
          <li>Lecture Slides</li>
        </ul>
      </section>

      <section className="course-info">
        <h2>Course Progress</h2>

        <p>
          Your current progress: {course.progress}%
        </p>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </section>
    </div>
  )
}

export default CourseDetail