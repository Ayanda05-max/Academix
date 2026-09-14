function QuizPage() {
  return (
    <div className="quiz-page">
      <h1>Quiz Management</h1>

      <p>Create and manage quizzes for students.</p>

      <div className="quiz-card">
        <h3>Quiz 1</h3>
        <p>Course: Programming</p>
        <p>Questions: 10</p>
        <button>Edit Quiz</button>
      </div>

      <div className="quiz-card">
        <h3>Quiz 2</h3>
        <p>Course: Physics</p>
        <p>Questions: 8</p>
        <button>Edit Quiz</button>
      </div>

      <button>Create New Quiz</button>
    </div>
  );
}

export default QuizPage;