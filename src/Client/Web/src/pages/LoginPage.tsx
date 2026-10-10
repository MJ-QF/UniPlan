import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./LoginPage.css";

import { login } from "../api/authApi";
import type { LoginRequest } from "../types/auth";

import { getStudentByAccountId } from "../api/studentApi";
import { saveStudentId } from "../utils/session";

/* =========================
   Icons
========================= */
function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9l10-5 10 5-10 5L2 9z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 9v6" />
    </svg>
  );
}

/* =========================
   Floating tiles
========================= */
function BrandIcons() {
  return (
    <div className="brand-icons" aria-hidden="true">
      <span
        className="float-tile tile-teal tile-lg"
        style={{ insetInlineStart: "4%", top: "18%" }}
      >
        <CapIcon />
      </span>

      <span
        className="float-tile tile-paper tile-md"
        style={{ insetInlineStart: "38%", top: "4%" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" />
          <path d="M4 19a2 2 0 012-2h13" />
          <path d="M9 7h6" />
        </svg>
      </span>

      <span
        className="float-tile tile-gold tile-sm"
        style={{ insetInlineStart: "62%", top: "40%" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" />
        </svg>
      </span>

      <span
        className="float-tile tile-soft tile-md"
        style={{ insetInlineStart: "26%", top: "56%" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M5 20V12" />
          <path d="M12 20V6" />
          <path d="M19 20v-9" />
        </svg>
      </span>

      <span
        className="float-tile tile-outline tile-sm"
        style={{ insetInlineStart: "78%", top: "8%" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </span>

      <span
        className="float-tile tile-teal tile-sm"
        style={{ insetInlineStart: "84%", top: "62%" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5h16v11H9l-5 4V5z" />
        </svg>
      </span>

      <span className="float-dot dot-gold" style={{ insetInlineStart: "20%", top: "6%" }} />
      <span className="float-dot dot-soft" style={{ insetInlineStart: "56%", top: "78%" }} />
      <span className="float-dot dot-ring" style={{ insetInlineStart: "70%", top: "26%" }} />
    </div>
  );
}

/* =========================
   Page
========================= */
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

  const features = [
    "متابعة السجل الأكاديمي لحظة بلحظة",
    "تسجيل المقررات بخطوات بسيطة",
    "تواصل مباشر مع المرشد الأكاديمي",
  ];

  return (
    <main className="login-page-wrapper">

      <section className="login-brand-section" aria-label="عن المنصة">
        <div className="brand-content">
          <BrandIcons />

          <h1 className="brand-title">
            رحلتك الجامعية،
            <br />
            في مكان واحد.
          </h1>

          <p className="brand-description">
            منصة صُممت لتمنحك وضوحاً كاملاً في مسيرتك الدراسية،
            من أول مقرر حتى يوم التخرج.
          </p>

          <ul className="brand-features-list">
            {features.map((f) => (
              <li key={f} className="brand-feature-item">
                <span className="feature-icon-circle" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="login-form-section">
        <div className="form-card">

          <div className="form-logo-wrapper">
            <span className="form-emblem" aria-hidden="true">
              <CapIcon />
            </span>
          </div>

          <header className="form-header">
            <h2 className="form-title">تسجيل الدخول</h2>
            <p className="form-subtitle">
              أهلاً بعودتك، أدخل بياناتك للمتابعة.
            </p>
          </header>

          {errorMessage && (
            <div className="login-alert-error">{errorMessage}</div>
          )}

          <form className="login-form" onSubmit={handleLogin}>

            <div className="form-group">
              <label htmlFor="accountName" className="form-label">
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" />
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "جاري التحقق..." : "دخول"}
            </button>

          </form>

          <p className="form-footer-link">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="register-link">
              أنشئ حساباً
            </Link>
          </p>

        </div>
      </section>

    </main>
  );
}