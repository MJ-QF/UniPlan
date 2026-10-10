import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";

import { getMajors } from "../api/majorsApi";
import { createStudent } from "../api/studentApi";

import type { MajorResponse } from "../types/student";
import { saveStudentId } from "../utils/session";

/* =========================
   Icons
========================= */
function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5L2 9z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 9v6" />
    </svg>
  );
}

/* =========================
   Orbit System
========================= */
type OrbitStyle = React.CSSProperties & { "--a": string };

function OrbitNode({
  angle,
  tone,
  children,
}: {
  angle: number;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="signup-orbit-node"
      style={{ "--a": `${angle}deg` } as OrbitStyle}
    >
      <span className={`signup-orbit-chip signup-chip-${tone}`}>
        {children}
      </span>
    </span>
  );
}

function SignUpOrbit() {
  return (
    <div className="signup-orbit" aria-hidden="true">

      {/* Outer ring */}
      <span className="signup-orbit-ring signup-orbit-ring-outer">
        <OrbitNode angle={20} tone="paper">
          <CapIcon />
        </OrbitNode>

        <OrbitNode angle={150} tone="gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </OrbitNode>

        <OrbitNode angle={260} tone="outline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </OrbitNode>

        <span
          className="signup-orbit-node"
          style={{ "--a": "85deg" } as OrbitStyle}
        >
          <span className="signup-orbit-spark" />
        </span>
      </span>

      {/* Inner ring */}
      <span className="signup-orbit-ring signup-orbit-ring-inner">
        <OrbitNode angle={60} tone="soft">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        </OrbitNode>

        <span
          className="signup-orbit-node"
          style={{ "--a": "230deg" } as OrbitStyle}
        >
          <span className="signup-orbit-spark signup-orbit-spark-soft" />
        </span>
      </span>

      {/* Core */}
      <span className="signup-orbit-core">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="8" r="4" />
          <path d="M3 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
          <path d="M19 8v6M16 11h6" />
        </svg>
      </span>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function SignUp() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [majorId, setMajorId] = useState("");

  const [majors, setMajors] = useState<MajorResponse[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(true);
  const [majorsError, setMajorsError] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Load Majors */
  async function loadMajors() {
    try {
      setLoadingMajors(true);
      setMajorsError("");
      const data = await getMajors();
      setMajors(data);
    } catch (error) {
      console.error("Failed to load majors:", error);
      setMajorsError("تعذر تحميل الاختصاصات");
    } finally {
      setLoadingMajors(false);
    }
  }

  useEffect(() => {
    loadMajors();
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  function handleSelectMajor(id: number) {
    setMajorId(String(id));
    setIsDropdownOpen(false);
  }

  const selectedMajorName = majors.find(
    (m) => String(m.majorID) === majorId
  )?.majorName;

  /* Register */
  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (!majorId) {
      setErrorMessage("يرجى اختيار الاختصاص.");
      return;
    }

    try {
      setLoading(true);

      const student = await createStudent({
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
      });

      saveStudentId(student.studentID);
      navigate("/academic-record", { replace: true });
    } catch (error) {
      console.error("Register failed:", error);
      setErrorMessage("تعذر إنشاء الحساب. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    "أنشئ حسابك ببريدك الجامعي",
    "اختر تخصصك الأكاديمي",
    "ابدأ بمتابعة مقرراتك فوراً",
  ];

  return (
    <main className="signup-page">

      {/* Brand Panel */}
      <section className="signup-brand-section" aria-label="عن المنصة">
        <div className="signup-brand-content">
          <SignUpOrbit />

          <h2 className="signup-brand-title">
            ثلاث خطوات، وتبدأ.
          </h2>

          <p className="signup-brand-description">
            انضم إلى آلاف الطلاب الذين يديرون مسيرتهم الدراسية
            بوضوح وثقة.
          </p>

          <ol className="signup-steps">
            {steps.map((s) => (
              <li key={s} className="signup-step">
                {s}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Form Panel */}
      <section className="signup-form-section">
        <div className="signup-card">

          <header className="signup-header">
            <span className="signup-emblem" aria-hidden="true">
              <CapIcon />
            </span>

            <h1 className="signup-title">إنشاء حساب جديد</h1>
            <p className="signup-subtitle">
              بضع معلومات فقط، وتبدأ رحلتك معنا.
            </p>
          </header>

          {errorMessage && (
            <div className="signup-error">{errorMessage}</div>
          )}

          <form className="signup-form" onSubmit={handleRegister}>

            <div className="form-group">
              <label htmlFor="firstName">الاسم الأول</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="أدخل الاسم الأول"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="middleName">الاسم الأوسط</label>
              <input
                id="middleName"
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="أدخل الاسم الأوسط"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">الكنية</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="أدخل الكنية"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">اسم المستخدم</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>الاختصاص</label>

              {majorsError ? (
                <div className="major-error">
                  <span>{majorsError}</span>
                  <button type="button" onClick={loadMajors}>
                    إعادة المحاولة
                  </button>
                </div>
              ) : (
                <div
                  className={`custom-dropdown ${
                    isDropdownOpen ? "custom-dropdown-open" : ""
                  }`}
                  ref={dropdownRef}
                >
                  <button
                    type="button"
                    className={`custom-dropdown-trigger ${
                      selectedMajorName ? "has-value" : ""
                    }`}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    disabled={loadingMajors || loading}
                  >
                    <span className="custom-dropdown-value">
                      {loadingMajors
                        ? "جاري التحميل..."
                        : selectedMajorName ?? "اختر الاختصاص"}
                    </span>

                    <svg
                      className="custom-dropdown-chevron"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <ul className="custom-dropdown-menu">
                      {majors.map((major) => {
                        const isSelected =
                          String(major.majorID) === majorId;

                        return (
                          <li key={major.majorID}>
                            <button
                              type="button"
                              className={`custom-dropdown-item ${
                                isSelected ? "is-selected" : ""
                              }`}
                              onClick={() =>
                                handleSelectMajor(major.majorID)
                              }
                            >
                              <span>{major.majorName}</span>
                              {isSelected && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12l5 5L20 7" />
                                </svg>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">كلمة المرور</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="signup-submit"
              disabled={loading || loadingMajors || !!majorsError}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الحساب"
              )}
            </button>

          </form>

          <p className="signup-footer">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="signup-login-link">
              سجّل الدخول
            </Link>
          </p>

        </div>
      </section>

    </main>
  );
}