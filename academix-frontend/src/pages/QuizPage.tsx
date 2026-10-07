import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createQuiz, getLecturerCourses, getQuizzesForCourse } from "../services/quizService";
import type { CourseOption, Quiz } from "../services/quizService";

type DraftQuestion = {
  text: string;
  options: string[];
  correctIndex: number;
  marks: number;
};

const MAX_OPTIONS = 6;

function newQuestion(): DraftQuestion {
  return { text: "", options: ["", ""], correctIndex: 0, marks: 1 };
}

function getCurrentUserId(): number | null {
  for (const key of ["user", "currentUser"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const id = parsed?.id ?? parsed?.user?.id;
      if (typeof id === "number") return id;
    } catch {
    }
  }
  return null;
}

function courseLabel(c: CourseOption) {
  return c.title ?? c.name ?? `Course ${c.id}`;
}

function errorText(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

function QuizPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseId, setCourseId] = useState<number | "">("");

  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizzesError, setQuizzesError] = useState("");
  const [openQuizId, setOpenQuizId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLecturerCourses()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const me = getCurrentUserId();
        const mine = me === null ? list : list.filter((c) => c.instructorId === undefined || c.instructorId === me);
        setCourses(mine);
        if (mine.length > 0) setCourseId(mine[0].id);
      })
      .catch((err) => {
        if (!cancelled) setError(errorText(err));
      })
      .finally(() => {
        if (!cancelled) setCoursesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadQuizzes(id: number) {
    setQuizzesLoading(true);
    setQuizzesError("");
    try {
      setQuizzes(await getQuizzesForCourse(id));
    } catch (err) {
      setQuizzes([]);
      setQuizzesError(errorText(err));
    } finally {
      setQuizzesLoading(false);
    }
  }

  useEffect(() => {
    if (courseId === "") {
      setQuizzes([]);
      return;
    }
    loadQuizzes(courseId);
  }, [courseId]);

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q
      )
    );
  }

  function addOption(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex && q.options.length < MAX_OPTIONS ? { ...q, options: [...q.options, ""] } : q
      )
    );
  }

  function removeOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || q.options.length <= 2) return q;
        let correct = q.correctIndex;
        if (oIndex === correct) correct = 0;
        else if (oIndex < correct) correct -= 1;
        return { ...q, options: q.options.filter((_, j) => j !== oIndex), correctIndex: correct };
      })
    );
  }

  function validate(): string {
    if (courseId === "") return "Please choose a course.";
    if (!title.trim()) return "Please enter a quiz title.";
    if (timeLimit.trim() !== "" && (!Number.isInteger(Number(timeLimit)) || Number(timeLimit) <= 0)) {
      return "Time limit must be a whole number of minutes greater than 0, or left empty.";
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const n = i + 1;
      if (!q.text.trim()) return `Question ${n} needs text.`;
      if (q.options.some((o) => !o.trim())) return `Question ${n} has an empty option.`;
      if (!Number.isInteger(q.marks) || q.marks <= 0) return `Question ${n} marks must be a whole number greater than 0.`;
    }
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    setError("");

    const problem = validate();
    if (problem) {
      setError(problem);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      const saved = await createQuiz({
        courseId: courseId as number,
        title: title.trim(),
        timeLimit: timeLimit.trim() === "" ? null : Number(timeLimit),
        questions: questions.map((q) => ({
          text: q.text.trim(),
          options: q.options.map((o) => o.trim()),
          correctIndex: q.correctIndex,
          marks: q.marks,
        })),
      });
      setSuccess(`Quiz "${saved.title}" was created with ${saved.questions.length} question(s), ${saved.totalMarks} marks in total. Students enrolled in this course can now see it.`);
      setTitle("");
      setTimeLimit("");
      setQuestions([newQuestion()]);
      await loadQuizzes(courseId as number);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="qz-page">
      <style>{css}</style>

      <h1>Quiz Management</h1>
      <p className="qz-muted">Create quizzes for your courses. Enrolled students see them straight away.</p>

      {success && <div className="qz-banner qz-success" role="status">{success}</div>}
      {error && <div className="qz-banner qz-error" role="alert">{error}</div>}

      <section className="qz-card">
        <h2>Create New Quiz</h2>

        {coursesLoading ? (
          <p className="qz-muted">Loading your courses...</p>
        ) : courses.length === 0 ? (
          <p className="qz-muted">You have no courses yet. Create a course first, then add quizzes to it.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="qz-row">
              <label className="qz-field">
                <span>Course</span>
                <select value={courseId} onChange={(e) => setCourseId(Number(e.target.value))} required>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{courseLabel(c)}</option>
                  ))}
                </select>
              </label>

              <label className="qz-field">
                <span>Quiz title</span>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 3 Quiz" required />
              </label>

              <label className="qz-field qz-narrow">
                <span>Time limit (minutes, optional)</span>
                <input type="number" min="1" step="1" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="No limit" />
              </label>
            </div>

            <h3>Questions</h3>

            {questions.map((q, qi) => (
              <div className="qz-question" key={qi}>
                <div className="qz-question-head">
                  <strong>Question {qi + 1}</strong>
                  {questions.length > 1 && (
                    <button type="button" className="qz-link" onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}>
                      Remove question
                    </button>
                  )}
                </div>

                <label className="qz-field">
                  <span>Question text</span>
                  <textarea rows={2} value={q.text} onChange={(e) => updateQuestion(qi, { text: e.target.value })} placeholder="Type the question" />
                </label>

                <p className="qz-muted qz-small">Answer options. Tick the correct one.</p>
                {q.options.map((o, oi) => (
                  <div className="qz-option" key={oi}>
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(qi, { correctIndex: oi })}
                      aria-label={`Option ${oi + 1} is correct`}
                    />
                    <input type="text" value={o} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                    {q.options.length > 2 && (
                      <button type="button" className="qz-link" onClick={() => removeOption(qi, oi)} aria-label={`Remove option ${oi + 1}`}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <div className="qz-row qz-row-end">
                  {q.options.length < MAX_OPTIONS && (
                    <button type="button" className="qz-secondary" onClick={() => addOption(qi)}>Add option</button>
                  )}
                  <label className="qz-field qz-narrow">
                    <span>Marks</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={q.marks}
                      onChange={(e) => updateQuestion(qi, { marks: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            ))}

            <div className="qz-actions">
              <button type="button" className="qz-secondary" onClick={() => setQuestions((prev) => [...prev, newQuestion()])}>
                Add question
              </button>
              <button type="submit" className="qz-primary" disabled={saving}>
                {saving ? "Saving..." : "Create Quiz"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="qz-card">
        <h2>Existing Quizzes</h2>

        {courses.length > 0 && (
          <p className="qz-muted">
            Showing quizzes saved for: <strong>{courseLabel(courses.find((c) => c.id === courseId) ?? courses[0])}</strong>
          </p>
        )}

        {quizzesLoading && <p className="qz-muted">Loading quizzes...</p>}
        {quizzesError && <div className="qz-banner qz-error" role="alert">{quizzesError}</div>}
        {!quizzesLoading && !quizzesError && courseId !== "" && quizzes.length === 0 && (
          <p className="qz-muted">No quizzes have been created for this course yet.</p>
        )}

        <div className="qz-list">
          {quizzes.map((quiz) => (
            <div className="qz-quiz" key={quiz.id}>
              <h3>{quiz.title}</h3>
              <p className="qz-muted">
                {quiz.questions.length} question(s) · {quiz.totalMarks} marks ·{" "}
                {quiz.timeLimit ? `${quiz.timeLimit} min` : "No time limit"}
              </p>
              <button type="button" className="qz-secondary" onClick={() => setOpenQuizId(openQuizId === quiz.id ? null : quiz.id)}>
                {openQuizId === quiz.id ? "Hide questions" : "View questions"}
              </button>

              {openQuizId === quiz.id && (
                <ol className="qz-review">
                  {quiz.questions.map((q, i) => (
                    <li key={i}>
                      <div>{q.text} <span className="qz-muted">({q.marks} mark{q.marks === 1 ? "" : "s"})</span></div>
                      <ul>
                        {q.options.map((o, oi) => (
                          <li key={oi} className={q.correctIndex === oi ? "qz-correct" : ""}>
                            {o}{q.correctIndex === oi ? " ✓" : ""}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>

        <p className="qz-muted qz-small"></p>
      </section>
    </div>
  );
}

const css = `
.qz-page { max-width: 900px; margin: 0 auto; padding: 16px; box-sizing: border-box; width: 100%; }
.qz-page * { box-sizing: border-box; }
.qz-page h1 { color: #1E3A5F; font-size: 1.75rem; margin: 0 0 4px; }
.qz-page h2 { color: #1E3A5F; font-size: 1.25rem; margin: 0 0 12px; }
.qz-page h3 { color: #2C3E50; font-size: 1.05rem; margin: 16px 0 8px; }
.qz-muted { color: #566573; }
.qz-small { font-size: 0.85rem; }
.qz-card { background: #fff; border: 1px solid #d9dee3; border-radius: 10px; padding: 16px; margin: 16px 0; }
.qz-banner { padding: 12px 14px; border-radius: 8px; margin: 12px 0; font-weight: 500; }
.qz-success { background: #E6F4EA; color: #1A6B3C; border: 1px solid #b7dfc4; }
.qz-error { background: #FDECEA; color: #C0392B; border: 1px solid #f2b8b2; }
.qz-row { display: flex; flex-wrap: wrap; gap: 12px; }
.qz-row-end { align-items: flex-end; margin-top: 8px; }
.qz-field { display: flex; flex-direction: column; gap: 4px; flex: 1 1 220px; min-width: 0; margin-bottom: 8px; }
.qz-narrow { flex: 0 1 180px; }
.qz-field span { font-size: 0.85rem; font-weight: 500; color: #566573; }
.qz-page input[type="text"], .qz-page input[type="number"], .qz-page select, .qz-page textarea {
  width: 100%; padding: 9px 10px; border: 1px solid #c3cad1; border-radius: 6px; font: inherit; background: #fff; color: #2C3E50;
}
.qz-question { border: 1px solid #d9dee3; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #F8FAFB; }
.qz-question-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; }
.qz-option { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.qz-option input[type="radio"] { flex: 0 0 auto; width: 18px; height: 18px; }
.qz-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; margin-top: 8px; }
.qz-primary, .qz-secondary { padding: 10px 18px; border-radius: 6px; font: inherit; font-weight: 600; cursor: pointer; }
.qz-primary { background: #2E86AB; color: #fff; border: 1px solid #2E86AB; }
.qz-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.qz-secondary { background: #fff; color: #2E86AB; border: 1px solid #2E86AB; }
.qz-link { background: none; border: none; color: #C0392B; cursor: pointer; font: inherit; padding: 4px; white-space: nowrap; }
.qz-list { display: grid; gap: 12px; grid-template-columns: 1fr; }
.qz-quiz { border: 1px solid #d9dee3; border-radius: 8px; padding: 12px; }
.qz-quiz h3 { margin-top: 0; }
.qz-review { margin: 12px 0 0; padding-left: 20px; }
.qz-review ul { margin: 4px 0 10px; padding-left: 18px; }
.qz-correct { color: #1A6B3C; font-weight: 600; }
@media (min-width: 700px) { .qz-list { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) {
  .qz-page { padding: 10px; }
  .qz-card { padding: 12px; }
  .qz-narrow { flex: 1 1 100%; }
  .qz-actions > button { width: 100%; }
  .qz-option { flex-wrap: wrap; }
  .qz-option input[type="text"] { flex: 1 1 60%; }
}
`;

export default QuizPage;