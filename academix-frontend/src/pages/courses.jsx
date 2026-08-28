import CourseCard from "../components/CourseCard";

function Courses() {
  return (
    <div className="courses-page">
      <h1>Courses</h1>

      <p>Browse the courses available on Academix.</p>

      <div className="course-list">
        <CourseCard
          name="Programming"
          description="Learn the basics of programming."
        />

        <CourseCard
          name="Physics"
          description="Explore the principles of physics."
        />

        <CourseCard
          name="Mathematics"
          description="Build your mathematical skills."
        />
      </div>
    </div>
  );
}

export default Courses;