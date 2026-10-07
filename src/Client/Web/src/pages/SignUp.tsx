import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";

import { getMajors } from "../api/majorsApi";
import { createStudent } from "../api/studentApi";

import type { MajorResponse } from "../types/student";
import { saveStudentId } from "../utils/session";

import logo from "../assets/UniPlan.png";

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

  // ✅ Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* =========================
     Load Majors
  ========================= */
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

  /* =========================
     Close dropdown on outside click
  ========================= */
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

  /* =========================
     Select Major
  ========================= */
  function handleSelectMajor(id: number) {
    setMajorId(String(id));
    setIsDropdownOpen(false);
  }

  const selectedMajorName = majors.find(
    (m) => String(m.majorID) === majorId
  )?.majorName;

  /* =========================
     Register
  ========================= */
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

  return (
    <div className="signup-page">
      <div className="signup-card">

        {/* =========================
            Header — Logo + Title
        ========================= */}
        <header className="signup-header">
          <img src={logo} alt="UniPlan" className="signup-logo" />
          <h1 className="signup-title">إنشاء حساب</h1>
          <p className="signup-subtitle">
            املأ البيانات لإنشاء حسابك في UniPlan
          </p>
        </header>

        {/* Error */}
        {errorMessage && (
          <div className="signup-error">{errorMessage}</div>
        )}

        {/* =========================
            Form
        ========================= */}
        <form className="signup-form" onSubmit={handleRegister}>

          {/* Row 1: First + Middle */}
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

          {/* Row 2: Last + Username */}
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

          {/* Row 3: Email + Major جنب بعض */}
          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
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
                {/* Trigger */}
                <button
                  type="button"
                  className={`custom-dropdown-trigger ${
                    selectedMajorName ? "has-value" : ""
                  }`}
                  onClick={() =>
                    setIsDropdownOpen((prev) => !prev)
                  }
                  disabled={loadingMajors || loading}
                >
                  <span className="custom-dropdown-value">
                    {loadingMajors
                      ? "جاري التحميل..."
                      : selectedMajorName ?? "اختر الاختصاص"}
                  </span>

                  <svg
                    className="custom-dropdown-chevron"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Menu */}
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
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
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

          {/* Row 4: Password + Confirm */}
          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
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
              placeholder="أعد إدخال كلمة المرور"
              required
              disabled={loading}
            />
          </div>

          {/* Submit */}
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

        {/* Footer */}
        <div className="signup-footer">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="signup-login-link">
            تسجيل الدخول
          </Link>
        </div>

      </div>
    </div>
  );
}