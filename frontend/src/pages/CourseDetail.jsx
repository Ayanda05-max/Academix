import { useParams } from 'react-router-dom'
import './CourseDetail.css'

function CourseDetail() {
  const { courseId } = useParams()

  let course

  if (courseId === 'information-management') {
    course = {
      title: 'Database Systems',
      code: 'IM101',
      department: 'Information Management',
      lecturer: 'Dr. John Smith',
      credits: '12',
      semester: 'Semester 1',
      progress: '60%',
      overview:
        'This course introduces students to databases, data management and information systems.',
      materials: [
        'Database Systems Notes',
        'Database Exercises',
        'Lecture Slides'
      ]
    }
  } else if (courseId === 'mathematics') {
    course = {
      title: 'Discrete Mathematics',
      code: 'MATH101',
      department: 'Mathematics',
      lecturer: 'Dr. Sarah Williams',
      credits: '12',
      semester: 'Semester 1',
      progress: '85%',
      overview:
        'This course covers logic, sets, graphs and mathematical structures.',
      materials: [
        'Discrete Mathematics Notes',
        'Mathematics Exercises',
        'Lecture Slides'
      ]
    }
  } else if (courseId === 'software-engineering') {
    course = {
      title: 'Software Development',
      code: 'SE101',
      department: 'Software Engineering',
      lecturer: 'Dr. Michael Brown',
      credits: '12',
      semester: 'Semester 1',
      progress: '70%',
      overview:
        'This course introduces software development methods and software engineering practices.',
      materials: [
        'Software Development Notes',
        'Development Exercises',
        'Lecture Slides'
      ]
    }
  } else {
    course = {
      title: 'Introduction to Programming',
      code: 'CS101',
      department: 'Computer Science',
      lecturer: 'Dr. John Smith',
      credits: '12',
      semester: 'Semester 1',
      progress: '75%',
      overview:
        'This course introduces students to the basic concepts of programming, problem solving and software development.',
      materials: [
        'Introduction to Programming Notes',
        'Programming Exercises',
        'Lecture Slides'
      ]
    }
  }

  return (
    <div className="course-detail">
      <h1>{course.title}</h1>

      <p className="course-code">
        Course Code: {course.code}
      </p>

      <section className="course-info">
        <h2>Course Overview</h2>

        <p>{course.overview}</p>
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
          {course.materials.map((material, index) => (
            <li key={index}>{material}</li>
          ))}
        </ul>
      </section>

      <section className="course-info">
        <h2>Course Progress</h2>

        <p>
          Your current progress: {course.progress}
        </p>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: course.progress }}
          ></div>
        </div>
      </section>
    </div>
  )
}

export default CourseDetail

