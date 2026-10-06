const BASE_URL = "http://localhost:8080/api";

export interface QuizQuestion {
  text: string;
  options: string[];
  marks: number;
}

export interface Quiz {
  id: number;
  courseId: number;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number | null; // minutes
  totalMarks: number;
}

export interface QuizScore {
  id: number;
  quizId: number;
  studentId: number;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch(BASE_URL + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data.message) message = data.message;
      else if (data.error) message = data.error;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export function getQuizzesForCourse(courseId: number) {
  return request<Quiz[]>(`/quizzes/course/${courseId}`);
}

export function submitQuiz(quizId: number, answers: (number | null)[]) {
  return request<QuizScore>(`/quizzes/${quizId}/submit`, "POST", { answers });
}

// Returns null when the student has not attempted the quiz yet (backend answers 404)
export async function getQuizResult(quizId: number, studentId: number): Promise<QuizScore | null> {
  try {
    return await request<QuizScore>(`/quizzes/${quizId}/results/${studentId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}