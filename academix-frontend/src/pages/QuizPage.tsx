import { useState } from "react";

type Quiz = {
  title: string;
  course: string;
  questions: number;
};

function QuizPage() {
  const [title, setTitle] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [questions, setQuestions] = useState<number>(0);

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      title: "Quiz 1",
      course: "Programming",
      questions: 10,
    },
    {
      title: "Quiz 2",
      course: "Physics",
      questions: 8,
    },
  ]);

  function handleCreateQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newQuiz: Quiz = {
      title: title,
      course: course,
      questions: questions,
    };

    setQuizzes([...quizzes, newQuiz]);

    setTitle("");
    setCourse("");
    setQuestions(0);
  }

  return (
    <div className="quiz-page">
      <h1>Quiz Management</h1>

      <p>Create and manage quizzes for students.</p>

      <h2>Create New Quiz</h2>

      <form onSubmit={handleCreateQuiz}>
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
          onChange={(event) => setQuestions(Number(event.target.value))}
          min="1"
          required
        />

        <button type="submit">Create Quiz</button>
      </form>

      <h2>Existing Quizzes</h2>

      {quizzes.map((quiz, index) => (
        <div className="quiz-card" key={index}>
          <h3>{quiz.title}</h3>
          <p>Course: {quiz.course}</p>
          <p>Questions: {quiz.questions}</p>
          <button>Edit Quiz</button>
        </div>
      ))}
    </div>
  );
}

export default QuizPage;