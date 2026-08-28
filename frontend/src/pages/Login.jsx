import './Login.css'

function Login() {
  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-brand">
          <div className="brand-icon">A</div>
          <h1>Academix</h1>
          <p>Course Management System</p>
        </div>

        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">
            Sign in to access your Academix account
          </p>

          <form>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
              />
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-submit">
              Login
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <p className="account-text">
            Don't have an account?
            <button type="button" className="create-account">
              Create account
            </button>
          </p>
        </div>

        <p className="login-footer">
          © 2026 Academix. All rights reserved.
        </p>

      </div>
    </div>
  )
}

export default Login