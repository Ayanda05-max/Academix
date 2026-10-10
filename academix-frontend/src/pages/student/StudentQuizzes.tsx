import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyEnrollments, getUserId } from "../../services/studentService";
import { getQuizResult, getQuizzesForCourse } from "../../services/quizService";
import type { Quiz, QuizScore } from "../../services/quizService";

interface QuizRow {
  quiz: Quiz;
  courseTitle: string;
  result: QuizScore | null;
}

function StudentQuizzes() {
  const [rows, setRows] = useState<QuizRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const enrollments = (await getMyEnrollments()).filter((e) => e.status === "ACTIVE");

        const perCourse = await Promise.allSettled(
          enrollments.map((e) => getQuizzesForCourse(e.courseId))
        );

        const collected: QuizRow[] = [];
        for (let i = 0; i < enrollments.length; i++) {
          const outcome = perCourse[i];
          if (outcome.status !== "fulfilled") continue; // e.g. unpublished course
          for (const quiz of outcome.value) {
            const result = await getQuizResult(quiz.id, getUserId()).catch(() => null);
            collected.push({ quiz, courseTitle: enrollments[i].courseTitle, result });
          }
        }
        setRows(collected);
      } catch {
        setError("Could not load your quizzes.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="st-sub">Loading...</p>;

  return (
    <>
      <h1 className="st-title">Quizzes</h1>
      <p className="st-sub">Each quiz can only be attempted once.</p>

      {error && <div className="st-error">{error}</div>}
      {!error && rows.length === 0 && (
        <div className="st-empty">There are no quizzes for your courses yet.</div>
      )}

      <div className="st-grid">
        {rows.map(({ quiz, courseTitle, result }) => (
          <div className="st-card" key={quiz.id}>
            <h2 className="st-course-title">{quiz.title}</h2>
            <p className="st-meta">{courseTitle}</p>
            <p className="st-meta">
              {quiz.questions.length} questions · {quiz.totalMarks} marks
              {quiz.timeLimit ? ` · ${quiz.timeLimit} min` : ""}
            </p>

            {result ? (
              <p>
                <span className={`st-badge ${result.percentage >= 50 ? "good" : "bad"}`}>
                  {result.score}/{result.totalMarks} ({result.percentage}%)
                </span>
              </p>
            ) : (
              <p><span className="st-badge neutral">Not attempted</span></p>
            )}

            <Link
              className="st-btn"
              to={`/student/quizzes/${quiz.id}?course=${quiz.courseId}`}
            >
              {result ? "View result" : "Start quiz"}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export default StudentQuizzes;