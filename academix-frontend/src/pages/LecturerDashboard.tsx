import { useState } from "react";

type Submission = {
  id: number;
  student: string;
  assignment: string;
  grade: string;
};

function LecturerDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 1,
      student: "Thabo",
      assignment: "Programming Assignment 1",
      grade: "",
    },
    {
      id: 2,
      student: "Naledi",
      assignment: "Programming Assignment 1",
      grade: "",
    },
  ]);

  function handleGrade(id: number, grade: string) {
    const updatedSubmissions = submissions.map((submission) =>
      submission.id === id
        ? { ...submission, grade: grade }
        : submission
    );

    setSubmissions(updatedSubmissions);
  }

  return (
    <div className="lecturer-dashboard">
      <h1>Lecturer Dashboard</h1>

      <p>Manage courses, view submissions and grade students.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Manage Courses</h3>
          <p>View and manage the courses you are teaching.</p>
          <button>Manage Courses</button>
        </div>

        <div className="dashboard-card">
          <h3>Submissions</h3>
          <p>View assignments submitted by students.</p>
          <button>View Submissions</button>
        </div>

        <div className="dashboard-card">
          <h3>Grading</h3>
          <p>Review student work and record grades.</p>
          <button>Grade Students</button>
        </div>
      </div>

      <div className="submissions-section">
        <h2>Student Submissions</h2>

        {submissions.map((submission) => (
          <div className="submission-card" key={submission.id}>
            <h3>{submission.student}</h3>

            <p>
              Assignment: {submission.assignment}
            </p>

            <label>Grade:</label>

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Enter grade"
              value={submission.grade}
              onChange={(event) =>
                handleGrade(submission.id, event.target.value)
              }
            />

            {submission.grade && (
              <p>Current Grade: {submission.grade}%</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LecturerDashboard;