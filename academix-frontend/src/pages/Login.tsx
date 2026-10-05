import { useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginResponse = {
  token: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();

        // Save only the JWT token
        localStorage.setItem("token", data.token);

        // Save basic user information
        localStorage.setItem("userId", String(data.id));
        localStorage.setItem("firstName", data.firstName);
        localStorage.setItem("lastName", data.lastName);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);

        alert("Login successful");

        // Redirect according to the user's role
        if (data.role === "ADMIN") {
          navigate("/admin");
        } else if (data.role === "LECTURER") {
          navigate("/lecturer");
        } else {
          navigate("/");
        }
      } else {
        alert("Invalid email or password");
      }
    } catch (error) {
      alert("ERROR: " + String(error));
    }
  }

  return (
    <div className="login-page">
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;