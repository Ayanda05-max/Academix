import { Link } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <h2>Academix</h2>

      <div className="navigation-links">
        <Link to="/">Dashboard</Link>
        <Link to="/courses">Course Catalog</Link>
        <Link to="/assignments">Assignments</Link>
        <Link to="/grades">Grades & Progress</Link>
      </div>
    </nav>
  )
}

export default Navigation