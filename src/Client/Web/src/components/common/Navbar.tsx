import { NavLink, useNavigate } from "react-router-dom";
import { clearStudentId } from "../../utils/session";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearStudentId();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <div className="navbar-logo">
          <span className="navbar-logo-text">UniPlan</span>
        </div>

        {/* Links */}
        <ul className="navbar-links">
          <li>
            <NavLink
              to="/academic-record"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              السجل الأكاديمي
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/wishlists"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              قوائم الرغبات
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/schedule"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              الجدول الدراسي
            </NavLink>
          </li>
        </ul>

        {/* Logout */}
        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          تسجيل الخروج
        </button>

      </div>
    </nav>
  );
}