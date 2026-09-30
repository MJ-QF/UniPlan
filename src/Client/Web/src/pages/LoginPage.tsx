import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LoginPage.css";

import { login } from "../api/authApi";
import type { LoginRequest } from "../types/auth";

import { getStudentByAccountId } from "../api/studentApi";
import { saveStudentId } from "../utils/session";

import logo from "../assets/UniPlan.png";

export default function LoginPage() {
  const navigate = useNavigate();

  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (!accountName.trim() || !password) {
      setErrorMessage("يرجى إدخال اسم المستخدم وكلمة المرور.");
      return;
    }

    setLoading(true);

    const loginData: LoginRequest = {
      accountName: accountName.trim(),
      password,
    };

    try {
      const account = await login(loginData);
      const student = await getStudentByAccountId(account.accountID);

      if (!student) {
        setErrorMessage(
          "تم تسجيل الدخول، لكن لم يتم العثور على بيانات الطالب."
        );
        return;
      }

      saveStudentId(student.studentID);
      navigate("/academic-record", { replace: true });

    } catch (error) {
      console.error("Login failed:", error);

      if (error instanceof Error) {
        switch (error.message) {
          case "LOGIN_ERROR_401":
            setErrorMessage("اسم المستخدم أو كلمة المرور غير صحيحة.");
            break;
          case "LOGIN_ERROR_409":
            setErrorMessage("تعذر تسجيل الدخول بسبب تعارض في البيانات.");
            break;
          case "LOGIN_ERROR_422":
            setErrorMessage("البيانات المدخلة غير صالحة.");
            break;
          case "LOGIN_ERROR_500":
            setErrorMessage("يوجد خطأ في الخادم. يرجى المحاولة لاحقاً.");
            break;
          case "LOGIN_ERROR_NETWORK":
            setErrorMessage("تعذر الاتصال بالخادم. تأكد من تشغيل النظام.");
            break;
          default:
            setErrorMessage("تعذر تسجيل الدخول حالياً. حاول مرة أخرى.");
        }
      } else {
        setErrorMessage("تعذر تسجيل الدخول حالياً. حاول مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">

      {/* =========================
          Brand Section — داكن (يسار)
      ========================= */}

      <div className="login-brand-section">
        <div className="brand-content">

          <h1 className="brand-title">
            خطط مسيرتك
            <br />
            الأكاديمية
            <br />
            بذكاء
          </h1>

          <p className="brand-description">
            منصة متكاملة لإدارة جداولك الدراسية
            واختيار موادك الأكاديمية بكل سهولة ويسر
          </p>

          <ul className="brand-features-list">
            <li className="brand-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>إدارة المواد والجداول الدراسية</span>
            </li>

            <li className="brand-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>متابعة التقدم الأكاديمي</span>
            </li>

            <li className="brand-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>التخطيط للفصول القادمة</span>
            </li>
          </ul>

        </div>
      </div>

      {/* =========================
          Form Section — أبيض (يمين)
      ========================= */}

      <div className="login-form-section">
        <div className="form-card">

          {/* ✅ اللوغو داخل قسم الفورم — بحجم مضبوط */}
          <div className="form-logo-wrapper">
            <img
              src={logo}
              alt="UniPlan"
              className="form-logo-img"
            />
          </div>

          <div className="form-header">
            <h2 className="form-title">تسجيل الدخول</h2>
            <p className="form-subtitle">
              مرحباً بعودتك! أدخل بياناتك للمتابعة
            </p>
          </div>

          {errorMessage && (
            <div className="login-alert-error">
              {errorMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin}>

            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="accountName">
                اسم المستخدم
              </label>

              <div className="input-relative-wrapper">
                <input
                  id="accountName"
                  type="text"
                  className="form-input"
                  placeholder="أدخل اسم المستخدم"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />

                <span className="input-icon input-icon-right" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                كلمة المرور
              </label>

              <div className="input-relative-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <span className="input-icon input-icon-right" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>

                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </button>
          </form>

          <div className="form-footer-link">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="register-link">
              إنشاء حساب
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}