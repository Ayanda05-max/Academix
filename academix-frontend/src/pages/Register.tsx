import { useState } from "react";

function Register() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<string>("STUDENT");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "You must be signed in as an administrator to create an account."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
        }),
      });

      if (response.ok) {
        setSuccess("Account created successfully.");

        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("STUDENT");
      } else {
        setError(
          "Registration failed. Please check the account details and try again."
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to Academix. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container register-auth-container">
        {/* LEFT SIDE */}

        <section className="auth-welcome">
          <div className="auth-welcome-content">
            <div className="auth-logo">A</div>

            <p className="auth-platform-name">ACADEMIX</p>

            <h1>Build your academic community.</h1>

            <p className="auth-description">
              Create accounts for students, lecturers and
              administrators who use the Academix learning
              platform.
            </p>

            <div className="auth-features">
              <div>
                <span>01</span>
                <p>Register students for the learning platform</p>
              </div>

              <div>
                <span>02</span>
                <p>Create lecturer accounts for course management</p>
              </div>

              <div>
                <span>03</span>
                <p>Assign the appropriate system role</p>
              </div>
            </div>
          </div>

          <p className="auth-welcome-footer">
            Academix Administration
          </p>
        </section>

        {/* RIGHT SIDE */}

        <section className="auth-form-side register-form-side">
          <div className="auth-form-container register-form-container">
            <div className="auth-mobile-brand">
              <div className="auth-logo">A</div>
              <span>Academix</span>
            </div>

            <p className="auth-eyebrow">ACCOUNT MANAGEMENT</p>

            <h2>Create an account</h2>

            <p className="auth-form-description">
              Enter the user's details and select their role in
              Academix.
            </p>

            <form onSubmit={handleRegister}>
              {/* NAME */}

              <div className="register-name-row">
                <div className="form-group">
                  <label htmlFor="firstName">First name</label>

                  <input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    autoComplete="given-name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last name</label>

                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="form-group">
                <label htmlFor="registerEmail">
                  Email address
                </label>

                <input
                  id="registerEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div className="form-group">
                <label htmlFor="registerPassword">
                  Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="registerPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="new-password"
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
                    <PasswordEye hidden={showPassword} />
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter the password again"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    title={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <PasswordEye hidden={showConfirmPassword} />
                  </button>
                </div>
              </div>

              {/* ROLE */}

              <div className="form-group">
                <label htmlFor="role">Account role</label>

                <select
                  id="role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                >
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              {/* MESSAGES */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="register-success">
                  {success}
                </div>
              )}

              {/* SUBMIT */}

              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </button>
            </form>

            <p className="auth-help">
              Account creation is restricted to authorised
              administrators.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* PASSWORD EYE ICON */

function PasswordEye({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
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
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
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
  );
}

export default Register;