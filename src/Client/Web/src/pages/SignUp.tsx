import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

import { getMajors } from "../api/majorsApi";
import { createStudent } from "../api/studentApi";

import type { MajorResponse } from "../types/student";
import { saveStudentId } from "../utils/session";

import logo from "../assets/UniPlan.png";

export default function SignUp() {
  const navigate = useNavigate();

  // =========================
  // Form Data
  // =========================

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [majorId, setMajorId] = useState("");

  // =========================
  // Majors
  // =========================

  const [majors, setMajors] = useState<MajorResponse[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(true);
  const [majorsError, setMajorsError] = useState("");

  // =========================
  // Register State
  // =========================

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================
  // Load Majors
  // =========================

  async function loadMajors() {
    try {
      setLoadingMajors(true);
      setMajorsError("");

      const data = await getMajors();

      setMajors(data);
    } catch (error) {
      console.error("Failed to load majors:", error);

      setMajorsError("تعذر تحميل الاختصاصات حالياً.");
    } finally {
      setLoadingMajors(false);
    }
  }

  useEffect(() => {
    loadMajors();
  }, []);

  // =========================
  // Register
  // =========================

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");

    // Password confirmation
    if (password !== confirmPassword) {
      setErrorMessage("كلمتا المرور غير متطابقتين.");
      return;
    }

    // Major selection
    if (!majorId) {
      setErrorMessage("يرجى اختيار الاختصاص.");
      return;
    }

    try {
      setLoading(true);

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

      const student = await createStudent(payload);

      saveStudentId(student.studentID);

      navigate("/academic-record", {
        replace: true,
      });
    } catch (error) {
      console.error("Register failed:", error);

      setErrorMessage(
        "تعذر إنشاء الحساب حالياً. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="signup-page">
      <div className="signup-container">

        {/* =========================
            Header — Logo + Title
        ========================= */}

        <div className="signup-header">

          <img
            src={logo}
            alt="UniPlan"
            className="signup-logo"
          />

          <h1>إنشاء حساب</h1>

        </div>

        <form onSubmit={handleRegister}>

          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName">
              الاسم الأول
            </label>

            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              required
            />
          </div>

          {/* Middle Name */}
          <div className="form-group">
            <label htmlFor="middleName">
              الاسم الأوسط
            </label>

            <input
              id="middleName"
              type="text"
              value={middleName}
              onChange={(event) =>
                setMiddleName(event.target.value)
              }
              required
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName">
              الكنية
            </label>

            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              required
            />
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">
              اسم المستخدم
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              البريد الإلكتروني
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              كلمة المرور
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              تأكيد كلمة المرور
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
            />
          </div>

          {/* Major */}
          <div className="form-group">

            <label htmlFor="major">
              الاختصاص
            </label>

            {majorsError ? (
              <div className="major-error">

                <span>
                  {majorsError}
                </span>

                <button
                  type="button"
                  onClick={loadMajors}
                  disabled={loadingMajors}
                >
                  {loadingMajors
                    ? "جاري المحاولة..."
                    : "إعادة المحاولة"}
                </button>

              </div>
            ) : (
              <select
                id="major"
                value={majorId}
                onChange={(event) =>
                  setMajorId(event.target.value)
                }
                disabled={loadingMajors}
                required
              >
                <option value="">
                  {loadingMajors
                    ? "جاري تحميل الاختصاصات..."
                    : "اختر الاختصاص"}
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
            )}

          </div>

          {/* Register Error */}
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading ||
              loadingMajors ||
              !!majorsError
            }
          >
            {loading
              ? "جاري إنشاء الحساب..."
              : "إنشاء الحساب"}
          </button>

        </form>
      </div>
    </div>
  );
}