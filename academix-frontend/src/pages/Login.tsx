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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

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

        // Save authentication information
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", String(data.id));
        localStorage.setItem("firstName", data.firstName);
        localStorage.setItem("lastName", data.lastName);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);

        // Redirect according to role
        if (data.role === "ADMIN") {
          navigate("/admin");
        } else if (data.role === "LECTURER") {
          navigate("/lecturer");
        } else {
          navigate("/");
        }
      } else {
        setError("The email or password you entered is incorrect.");
      }
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to Academix. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* LEFT SIDE */}

        <section className="auth-welcome">
          <div className="auth-welcome-content">
            <div className="auth-logo">A</div>

            <p className="auth-platform-name">ACADEMIX</p>

            <h1>Your academic journey, all in one place.</h1>

            <p className="auth-description">
              Access your courses, assignments, learning materials,
              submissions and academic progress through one platform.
            </p>

            <div className="auth-features">
              <div>
                <span>01</span>
                <p>Manage courses and learning material</p>
              </div>

              <div>
                <span>02</span>
                <p>Complete assignments and assessments</p>
              </div>

              <div>
                <span>03</span>
                <p>Keep track of grades and progress</p>
              </div>
            </div>
          </div>

          <p className="auth-welcome-footer">
            Course Management System
          </p>
        </section>

        {/* RIGHT SIDE */}

        <section className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-mobile-brand">
              <div className="auth-logo">A</div>
              <span>Academix</span>
            </div>

            <p className="auth-eyebrow">WELCOME BACK</p>

            <h2>Sign in to Academix</h2>

            <p className="auth-form-description">
              Enter your account details to access your academic portal.
            </p>

            <form onSubmit={handleLogin}>
              {/* EMAIL */}

              <div className="form-group">
                <label htmlFor="email">Email address</label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    title={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      /* EYE WITH SLASH */
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 3l18 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 10.7a2 2 0 002.7 2.7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />

                        <path
                          d="M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9 6 9 6a17 17 0 01-3.1 3.7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M6.6 6.6C4.4 8.1 3 10 3 10s3.5 6 9 6a9.8 9.8 0 004-.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      /* EYE */
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="auth-help">
              Having trouble signing in? Contact your system
              administrator.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;