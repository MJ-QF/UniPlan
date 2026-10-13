import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";

import { getMajors } from "../api/majorsApi";
import { createStudent } from "../api/studentApi";

import PersonalInfoFields, {
  emptyPersonalInfo,
  type PersonalInfoValues,
} from "../components/forms/PersonalInfoFields";
import { toCreateStudentPayload } from "../utils/personalInfo";

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

  const [values, setValues] = useState<PersonalInfoValues>(emptyPersonalInfo);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [majors, setMajors] = useState<MajorResponse[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(true);
  const [majorsError, setMajorsError] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function setField(field: keyof PersonalInfoValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

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

    if (!values.majorID) {
      setErrorMessage("يرجى اختيار الاختصاص.");
      return;
    }

    try {
      setLoading(true);

      const student = await createStudent(
        toCreateStudentPayload(values, password)
      );

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

            <PersonalInfoFields
              flat
              values={values}
              onChange={setField}
              majors={majors}
              majorsLoading={loadingMajors}
              majorsError={majorsError}
              onRetryMajors={loadMajors}
              disabled={loading}
            />

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