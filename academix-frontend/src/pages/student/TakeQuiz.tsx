import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getUserId } from "../../services/studentService";
import {
  ApiError,
  getQuizResult,
  getQuizzesForCourse,
  submitQuiz,
} from "../../services/quizService";
import type { Quiz, QuizScore } from "../../services/quizService";

type Phase = "loading" | "intro" | "taking" | "done" | "error";

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function TakeQuiz() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = Number(searchParams.get("course"));

  const [phase, setPhase] = useState<Phase>("loading");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizScore | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const answersRef = useRef<(number | null)[]>([]);
  const submittedRef = useRef(false);

  // Load the quiz (no single-quiz endpoint, so find it in the course list)
  useEffect(() => {
    async function load() {
      try {
        const quizzes = await getQuizzesForCourse(courseId);
        const found = quizzes.find((q) => q.id === Number(quizId));
        if (!found) {
          setError("Quiz not found.");
          setPhase("error");
          return;
        }
        setQuiz(found);

        const existing = await getQuizResult(found.id, getUserId());
        if (existing) {
          setResult(existing);
          setPhase("done");
        } else {
          setPhase("intro");
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load this quiz.");
        setPhase("error");
      }
    }
    load();
  }, [quizId, courseId]);

  function start() {
    if (!quiz) return;
    const blank = new Array<number | null>(quiz.questions.length).fill(null);
    answersRef.current = blank;
    setAnswers(blank);
    setSecondsLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
    setPhase("taking");
  }

  function choose(questionIndex: number, optionIndex: number) {
    const next = [...answersRef.current];
    next[questionIndex] = optionIndex;
    answersRef.current = next;
    setAnswers(next);
  }

  async function submit() {
    if (!quiz || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const score = await submitQuiz(quiz.id, answersRef.current);
      setResult(score);
      setPhase("done");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Already submitted earlier: show the stored result instead
        const existing = await getQuizResult(quiz.id, getUserId()).catch(() => null);
        if (existing) {
          setResult(existing);
          setPhase("done");
          return;
        }
      }
      submittedRef.current = false;
      setError(err instanceof ApiError ? err.message : "Could not submit your answers.");
    } finally {
      setSubmitting(false);
    }
  }

  // Countdown; submits automatically when time runs out
  useEffect(() => {
    if (phase !== "taking" || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  if (phase === "loading") return <p className="st-sub">Loading...</p>;

  if (phase === "error") {
    return (
      <>
        <div className="st-error">{error}</div>
        <Link to="/student/quizzes">Back to quizzes</Link>
      </>
    );
  }

  if (!quiz) return null;

  if (phase === "intro") {
    return (
      <>
        <h1 className="st-title">{quiz.title}</h1>
        <div className="st-card">
          <p>{quiz.questions.length} questions · {quiz.totalMarks} marks</p>
          <p>
            {quiz.timeLimit
              ? `You have ${quiz.timeLimit} minutes. The quiz submits automatically when time runs out.`
              : "There is no time limit."}
          </p>
          <p><strong>You can only attempt this quiz once.</strong> Do not refresh the page once you start.</p>
          <button type="button" className="st-btn" onClick={start}>Start quiz</button>{" "}
          <Link to="/student/quizzes">Back</Link>
        </div>
      </>
    );
  }

  if (phase === "done" && result) {
    return (
      <>
        <h1 className="st-title">{quiz.title}</h1>
        <div className="st-card">
          <div className="st-stat-num">{result.score}/{result.totalMarks}</div>
          <p>
            <span className={`st-badge ${result.percentage >= 50 ? "good" : "bad"}`}>
              {result.percentage}%
            </span>
          </p>
          <p className="st-meta">Submitted {new Date(result.submittedAt).toLocaleString("en-ZA")}</p>
          <Link to="/student/quizzes">Back to quizzes</Link>
        </div>
      </>
    );
  }

  // phase === "taking"
  const answered = answers.filter((a) => a !== null).length;

  return (
    <>
      <div className="st-quiz-bar">
        <h1 className="st-title" style={{ margin: 0 }}>{quiz.title}</h1>
        {secondsLeft !== null && (
          <span className={`st-timer ${secondsLeft <= 60 ? "low" : ""}`}>{formatTime(secondsLeft)}</span>
        )}
      </div>
      <p className="st-sub">{answered} of {quiz.questions.length} answered</p>

      {error && <div className="st-error">{error}</div>}

      {quiz.questions.map((q, qi) => (
        <div className="st-card st-question" key={qi}>
          <div className="st-meta">Question {qi + 1} · {q.marks} {q.marks === 1 ? "mark" : "marks"}</div>
          <p className="st-qtext">{q.text}</p>
          {q.options.map((opt, oi) => (
            <label className={`st-option ${answers[qi] === oi ? "selected" : ""}`} key={oi}>
              <input
                type="radio"
                name={`q-${qi}`}
                checked={answers[qi] === oi}
                onChange={() => choose(qi, oi)}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      <button type="button" className="st-btn" disabled={submitting} onClick={submit}>
        {submitting ? "Submitting..." : "Submit quiz"}
      </button>
    </>
  );
}

export default TakeQuiz;