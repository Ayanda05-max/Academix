import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LecturerDashboard from "./pages/LecturerDashboard";
import QuizPage from "./pages/QuizPage";
import AdminPanel from "./pages/AdminPanel";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;