import { Link } from "react-router-dom";
import React, { useState } from "react";
import "./SignUp.css";

interface Major {
  majorID: number;
  majorName: string;
}

export default function SignUp() {
  // =========================
  // Form State
  // =========================

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [majorId, setMajorId] = useState("");


  // =========================
  // Page State
  // =========================

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");


  // =========================
  // Temporary Majors
  // =========================

  /*
    مؤقتًا نستخدم تخصصات تجريبية
    بدل جلبها من Backend.

    لاحقًا سنستبدلها باستدعاء API الحقيقي.
  */

  const majors: Major[] = [
    {
      majorID: 1,
      majorName: "هندسة المعلوماتية",
    },
    {
      majorID: 2,
      majorName: "هندسة البرمجيات",
    },
    {
      majorID: 3,
      majorName: "علوم الحاسوب",
    },
  ];


  // =========================
  // Register
  // =========================

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // تنظيف الرسائل القديمة
    setErrorMessage("");
    setSuccessMessage("");


    // =========================
    // Validation
    // =========================

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !majorId
    ) {
      setErrorMessage(
        "يرجى تعبئة جميع الحقول المطلوبة."
      );

      return;
    }


    if (password.length < 8) {
      setErrorMessage(
        "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
      );

      return;
    }


    // =========================
    // Loading
    // =========================

    setLoading(true);


    // =========================
    // Data sent to Backend
    // =========================

    const payload = {
      accountData: {
        accountName: username,
        password: password,
        email: email,
      },

      personData: {
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
      },

      majorID: Number(majorId),
    };


    try {
      const response = await fetch(
        "http://localhost:5260/api/students",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );


      // =========================
      // Success
      // =========================

      if (response.status === 201) {
        setSuccessMessage(
          "تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن."
        );

        return;
      }


      // =========================
      // Server Error
      // =========================

      const serverError = await response.text();

      setErrorMessage(
        serverError ||
          "حدث خطأ أثناء إنشاء الحساب."
      );

    } catch (error) {

      setErrorMessage(
        "تعذر الاتصال بالخادم. تأكد من تشغيل الباك إند."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // UI
  // =========================

  return (
    <div className="register-page-wrapper">

      <div className="register-card">

        {/* Header */}

        <div className="register-header">

          <div className="register-logo-container">

            <span className="register-logo-text">
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


          <h2 className="register-title">
            إنشاء حساب جديد
          </h2>


          <p className="register-subtitle">
            أدخل بياناتك لإنشاء حسابك الأكاديمي
          </p>

        </div>


        {/* Error */}

        {errorMessage && (
          <div className="register-alert-error">
            {errorMessage}
          </div>
        )}


        {/* Success */}

        {successMessage && (
          <div className="register-alert-success">
            {successMessage}
          </div>
        )}


        {/* Form */}

        <form onSubmit={handleRegister}>

          {/* Names */}

          <div className="form-grid-3">

            <div className="form-group">

              <label className="form-label">
                الاسم الأول
              </label>

              <input
                type="text"
                className="form-input"
                placeholder="أحمد"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label className="form-label">
                الاسم الأوسط
              </label>

              <input
                type="text"
                className="form-input"
                placeholder="محمد"
                value={middleName}
                onChange={(e) =>
                  setMiddleName(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label className="form-label">
                اسم العائلة
              </label>

              <input
                type="text"
                className="form-input"
                placeholder="الزهراني"
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
              />

            </div>

          </div>


          {/* Username + Email */}

          <div className="form-grid-2">

            <div className="form-group">

              <label className="form-label">
                اسم المستخدم
              </label>

              <input
                type="text"
                className="form-input"
                placeholder="ahmed123"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label className="form-label">
                البريد الإلكتروني
              </label>

              <input
                type="email"
                className="form-input"
                placeholder="ahmed@uni.edu.sa"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

          </div>


          {/* Password + Major */}

          <div className="form-grid-2">

            <div className="form-group">

              <label className="form-label">
                كلمة المرور
              </label>

              <input
                type="password"
                className="form-input"
                placeholder="8 أحرف على الأقل"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label className="form-label">
                التخصص
              </label>

              <select
                className="form-select"
                value={majorId}
                onChange={(e) =>
                  setMajorId(e.target.value)
                }
              >

                <option value="" disabled>
                  اختر التخصص
                </option>

                {majors.map((major) => (
                  <option
                    key={major.majorID}
                    value={major.majorID}
                  >
                    {major.majorName}
                  </option>
                ))}

              </select>

            </div>

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >

            {loading
              ? "جاري الإنشاء..."
              : "إنشاء الحساب"}

          </button>

        </form>


        {/* Footer */}

        <div className="form-footer-link">

          لديك حساب بالفعل؟

          <Link
            to="/login"
            className="login-link"
          >
            تسجيل الدخول
          </Link>

        </div>

      </div>

    </div>
  );
}