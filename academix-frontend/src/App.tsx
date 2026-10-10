import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCourses from "./pages/student/MyCourses";
import StudentGrades from "./pages/student/StudentGrades";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentNotifications from "./pages/student/StudentNotifications";
import "./utils/toast";
import LecturerLayout from "./pages/lecturer/LecturerLayout";
import LecturerHome from "./pages/lecturer/LecturerHome";
import LecturerCourses from "./pages/lecturer/LecturerCourses";
import LecturerLessons from "./pages/lecturer/LecturerLessons";
import LecturerAssignments from "./pages/lecturer/LecturerAssignments";
import LecturerSubmissions from "./pages/lecturer/LecturerSubmissions";
import LecturerResources from "./pages/lecturer/LecturerResources";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminEnrolments from "./pages/admin/AdminEnrolments";

import NavBar from "./components/NavBar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import QuizPage from "./pages/QuizPage";
import "./App.css";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import TakeQuiz from "./pages/student/TakeQuiz";
import StudentResources from "./pages/student/StudentResources";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <main className="main-content">
        <Routes>
          {/* DEFAULT */}

          <Route
            path="/"
            element={<HomeRedirect />}
          />

          {/* PUBLIC */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* ADMIN */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/new" element={<Register />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="enrolments" element={<AdminEnrolments />} />
          </Route>

          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <Register />
              </ProtectedRoute>
            }
          />

          {/* LECTURER */}

          <Route
            path="/lecturer"
            element={
              <ProtectedRoute allowedRole="LECTURER">
                <LecturerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LecturerHome />} />
            <Route path="courses" element={<LecturerCourses />} />
            <Route path="lessons" element={<LecturerLessons />} />
            <Route path="assignments" element={<LecturerAssignments />} />
            <Route path="submissions" element={<LecturerSubmissions />} />
            <Route path="quizzes" element={<QuizPage />} />
            <Route path="resources" element={<LecturerResources />} />
          </Route>

          {/* STUDENT */}

          <Route
            path="/quiz"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <QuizPage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="notifications" element={<StudentNotifications />} />
                        <Route path="quizzes" element={<StudentQuizzes />} />
            <Route path="quizzes/:quizId" element={<TakeQuiz />} />
           <Route path="resources" element={<StudentResources />} />
          </Route>

          {/* UNKNOWN URL */}

          <Route
            path="*"
            element={<HomeRedirect />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

/* ========================================
   PROTECTED ROUTE
======================================== */

type ProtectedRouteProps = {
  allowedRole: string;
  children: React.ReactNode;
};

function ProtectedRoute({
  allowedRole,
  children,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // User is not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but has the wrong role
  if (role !== allowedRole) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}

/* ========================================
   HOME REDIRECT
======================================== */

function HomeRedirect() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={getDashboardPath(role)}
      replace
    />
  );
}

/* ========================================
   ROLE DASHBOARD
======================================== */

function getDashboardPath(role: string | null) {
  
    if (role === "STUDENT") return "/student";

  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "LECTURER") {
    return "/lecturer";
  }

  if (role === "STUDENT") {
    return "/quiz";
  }

  return "/login";
}

export default App;
