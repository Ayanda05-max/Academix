import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Navigation.css'

function Navigation() {
  const navigate = useNavigate()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return
    }

    navigate('/login')
  }

  return (
    <nav className="navigation">
      <h2>Academix</h2>

      <div className="navigation-links">
        <Link to="/">Dashboard</Link>
        <Link to="/courses">Course Catalog</Link>
        <Link to="/assignments">Assignments</Link>
        <Link to="/grades">Grades & Progress</Link>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navigation