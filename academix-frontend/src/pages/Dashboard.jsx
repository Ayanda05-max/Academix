import CourseCard from "../components/CourseCard";

function Dashboard() {
  return (
    <div>
      <h1>Welcome to Academix 👋</h1>

      <p>Learn. Grow. Succeed.</p>

      <button>Explore Courses</button>

      <h2>Popular Courses</h2>

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
  );
}

export default Dashboard;