function MyCourses() {
  return (
    <div className="my-courses-page">
      <h1>My Courses</h1>

      <p>Continue learning from where you left off.</p>

      <div className="my-course-card">
        <h3>Programming</h3>
        <p>Progress: 65%</p>
        <button>Continue Course</button>
      </div>

      <div className="my-course-card">
        <h3>Physics</h3>
        <p>Progress: 30%</p>
        <button>Continue Course</button>
      </div>
    </div>
  );
}

export default MyCourses;