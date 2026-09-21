import { useState } from "react";

type Quiz = {
  id: number;
  title: string;
  course: string;
  questions: number;
};

function QuizPage() {
  const [title, setTitle] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [questions, setQuestions] = useState<number>(1);

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      title: "Quiz 1",
      course: "Programming",
      questions: 10,
    },
    {
      id: 2,
      title: "Quiz 2",
      course: "Physics",
      questions: 8,
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId !== null) {
      const updatedQuizzes = quizzes.map((quiz) =>
        quiz.id === editingId
          ? {
              ...quiz,
              title: title,
              course: course,
              questions: questions,
            }
          : quiz
      );

      setQuizzes(updatedQuizzes);
      setEditingId(null);
    } else {
      const newQuiz: Quiz = {
        id: Date.now(),
        title: title,
        course: course,
        questions: questions,
      };

      setQuizzes([...quizzes, newQuiz]);
    }

    setTitle("");
    setCourse("");
    setQuestions(1);
  }

  function handleEdit(quiz: Quiz) {
    setTitle(quiz.title);
    setCourse(quiz.course);
    setQuestions(quiz.questions);
    setEditingId(quiz.id);
  }

  function handleDelete(id: number) {
    const remainingQuizzes = quizzes.filter(
      (quiz) => quiz.id !== id
    );

    setQuizzes(remainingQuizzes);
  }

  return (
    <div className="quiz-page">
      <h1>Quiz Management</h1>

      <p>Create and manage quizzes for students.</p>

      <div className="quiz-form">
        <h2>
          {editingId !== null ? "Edit Quiz" : "Create New Quiz"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Course"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Number of Questions"
            value={questions}
            onChange={(event) =>
              setQuestions(Number(event.target.value))
            }
            min="1"
            required
          />

          <button type="submit">
            {editingId !== null ? "Update Quiz" : "Create Quiz"}
          </button>
        </form>
      </div>

      <h2>Existing Quizzes</h2>

      <div className="quiz-list">
        {quizzes.map((quiz) => (
          <div className="quiz-card" key={quiz.id}>
            <h3>{quiz.title}</h3>

            <p>Course: {quiz.course}</p>

            <p>Questions: {quiz.questions}</p>

            <button onClick={() => handleEdit(quiz)}>
              Edit
            </button>

            <button onClick={() => handleDelete(quiz.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizPage;