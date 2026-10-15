import { NavLink, useNavigate } from "react-router-dom";
import { clearSession, isAdmin } from "../../utils/session";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const adminMode = isAdmin();

  function handleLogout() {
    clearSession();
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

          {/* Admin Links */}
          {adminMode && (
            <li>
              <NavLink
                to="/course-offerings"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                الشعب الدراسية
              </NavLink>
            </li>
          )}

          {/* Student Links */}
          {!adminMode && (
            <>
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
                  to="/schedules"
                  className={({ isActive }) =>
                    `navbar-link ${isActive ? "active" : ""}`
                  }
                >
                  الجداول الدراسية
                </NavLink>
              </li>
            </>
          )}

          {/* Shared */}
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              الملف الشخصي
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