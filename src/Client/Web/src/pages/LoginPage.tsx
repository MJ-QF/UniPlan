import { Link } from "react-router-dom";
import { useState } from "react";
import "./LoginPage.css";

import { login } from "../api/authApi";
import type { LoginRequest } from "../types/auth";

export default function LoginPage() {
  // =========================
  // Form State
  // =========================

  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // UI State
  // =========================

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================
  // Login
  // =========================

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");

    // Validation
    if (!accountName || !password) {
      setErrorMessage(
        "يرجى إدخال اسم المستخدم وكلمة المرور."
      );
      return;
    }

    setLoading(true);

    const loginData: LoginRequest = {
      accountName,
      password,
    };

    try {
      const account = await login(loginData);

      console.log("Login successful:", account);

      // لاحقاً:
      // 1. حفظ بيانات المستخدم / Token
      // 2. تحديد الـRole
      // 3. الانتقال إلى Home
      //
      // مثال لاحقاً:
      // navigate("/home");

    } catch (error) {
      console.error("Login failed:", error);

      if (error instanceof Error) {
        switch (error.message) {
          case "LOGIN_ERROR_401":
            setErrorMessage(
              "اسم المستخدم أو كلمة المرور غير صحيحة."
            );
            break;

          case "LOGIN_ERROR_422":
            setErrorMessage(
              "البيانات المدخلة غير مكتملة أو غير صالحة."
            );
            break;

          case "LOGIN_ERROR_409":
            setErrorMessage(
              "يوجد تعارض في البيانات."
            );
            break;

          default:
            setErrorMessage(
              "حدث خطأ في الخادم، يرجى المحاولة لاحقاً."
            );
        }
      } else {
        setErrorMessage(
          "تعذر الاتصال بالخادم، تأكد من تشغيل الـBackend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">

      {/* =========================
          Brand Section
      ========================= */}

      <div className="login-brand-section">
        <div className="brand-content">

          <div className="brand-logo-container">
            <span className="brand-logo-text">
              UniPlan
            </span>

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
            </svg>
          </div>

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

              <span>
                إدارة المواد والجداول الدراسية
              </span>
            </li>

            <li className="brand-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <span>
                متابعة التقدم الأكاديمي
              </span>
            </li>

            <li className="brand-feature-item">
              <div className="feature-icon-circle">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <span>
                التخطيط للفصول القادمة
              </span>
            </li>

          </ul>

        </div>
      </div>

      {/* =========================
          Login Form Section
      ========================= */}

      <div className="login-form-section">
        <div className="form-card">

          <div className="form-header">
            <h2 className="form-title">
              تسجيل الدخول
            </h2>

            <p className="form-subtitle">
              مرحباً بعودتك! أدخل بياناتك للمتابعة
            </p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="login-alert-error">
              {errorMessage}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            {/* Username */}
            <div className="form-group">

              <label
                className="form-label"
                htmlFor="accountName"
              >
                اسم المستخدم
              </label>

              <input
                id="accountName"
                type="text"
                className="form-input"
                placeholder="أدخل اسم المستخدم"
                value={accountName}
                onChange={(event) =>
                  setAccountName(event.target.value)
                }
              />

            </div>

            {/* Password */}
            <div className="form-group">

              <label
                className="form-label"
                htmlFor="password"
              >
                كلمة المرور
              </label>

              <div className="input-relative-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="form-input"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />

                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                >

                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line
                        x1="1"
                        y1="1"
                        x2="23"
                        y2="23"
                      />
                    </svg>
                  )}

                </button>

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? "جاري التحقق..."
                : "تسجيل الدخول"}
            </button>

          </form>

          {/* Register */}
          <div className="form-footer-link">
            ليس لديك حساب؟{" "}
            <Link
              to="/register"
              className="register-link"
            >
              إنشاء حساب
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}