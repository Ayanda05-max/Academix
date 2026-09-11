import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import Login from "./pages/Login";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

     <Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/courses" element={<Courses />} />
  <Route path="/my-courses" element={<MyCourses />} />
  <Route path="/login" element={<Login />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;