import { useEffect, useState } from "react";
import "./ProfilePage.css";
import PersonalInfoFields, {
  emptyPersonalInfo,
  type PersonalInfoValues,
} from "../components/forms/PersonalInfoFields";
import { getStudentById, updateStudent } from "../api/studentApi";
import { changePassword } from "../api/authApi";
import { getMajors } from "../api/majorsApi";
import { getStudentId } from "../utils/session";
import { getApiErrorMessage } from "../utils/apiError";
import {
  fromStudentResponse,
  toUpdateStudentPayload,
} from "../utils/personalInfo";
import type { MajorResponse, StudentResponse } from "../types/student";

const emptyPw = { oldPassword: "", newPassword: "", confirm: "" };

export default function ProfilePage() {
  const studentId = getStudentId();

  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [majors, setMajors] = useState<MajorResponse[]>([]);
  const [values, setValues] = useState<PersonalInfoValues>(emptyPersonalInfo);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState(emptyPw);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const load = async () => {
    if (!studentId) {
      setError("تعذر تحديد الحساب، سجّل الدخول من جديد.");
      setLoading(false);
      return;
    }
    try {
      const [s, m] = await Promise.all([
        getStudentById(studentId),
        getMajors(100),
      ]);
      setStudent(s);
      setMajors(m);
      setValues(fromStudentResponse(s));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const setField = (field: keyof PersonalInfoValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const startEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (student) setValues(fromStudentResponse(student));
    setError("");
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing || !studentId) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateStudent(studentId, toUpdateStudentPayload(values));
      await load();
      setIsEditing(false);
      setSuccess("تم حفظ التغييرات بنجاح.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openPw = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPwError("");
    setPwSuccess("");
    setShowPw(true);
  };

  const closePw = () => {
    setPw(emptyPw);
    setPwError("");
    setShowPw(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!student) return;
    if (pw.newPassword !== pw.confirm) {
      setPwError("كلمة المرور الجديدة وتأكيدها غير متطابقين.");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(student.accountInfo.accountID, {
        oldPassword: pw.oldPassword,
        newPassword: pw.newPassword,
      });
      setPw(emptyPw);
      setShowPw(false);
      setPwSuccess("تم تغيير كلمة المرور بنجاح.");
    } catch (err) {
      setPwError(getApiErrorMessage(err));
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p className="profile-loading">جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1 className="profile-title">الملف الشخصي</h1>
        <p className="profile-subtitle">
          {isEditing ? "عدّل معلوماتك ثم اضغط حفظ" : "معلوماتك الشخصية"}
        </p>

        <form onSubmit={handleSave}>
          <PersonalInfoFields
            values={values}
            onChange={setField}
            majors={majors}
            disabled={!isEditing || saving}
          />

          <div className="profile-readonly">
            <span>الساعات المنجزة</span>
            <strong>{student?.completedHours ?? 0}</strong>
          </div>

          {error && <div className="profile-msg profile-msg--error">{error}</div>}
          {success && (
            <div className="profile-msg profile-msg--success">{success}</div>
          )}

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button
                  key="save"
                  className="profile-btn"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </button>
                <button
                  key="cancel"
                  className="profile-btn profile-btn--outline"
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  إلغاء
                </button>
              </>
            ) : (
              <button
                key="edit"
                className="profile-btn"
                type="button"
                onClick={startEdit}
              >
                تعديل
              </button>
            )}
          </div>
        </form>

        <hr className="profile-divider" />

        <h2 className="profile-section-title">كلمة المرور</h2>

        {pwSuccess && (
          <div className="profile-msg profile-msg--success">{pwSuccess}</div>
        )}

        {!showPw ? (
          <div className="profile-actions">
            <button
              key="open-pw"
              className="profile-btn profile-btn--outline"
              type="button"
              onClick={openPw}
            >
              تغيير كلمة المرور
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="profile-pw">
            <div className="pi-group">
              <label>كلمة المرور الحالية</label>
              <input
                type="password"
                required
                value={pw.oldPassword}
                onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })}
              />
            </div>
            <div className="pi-group">
              <label>كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              />
            </div>
            <div className="pi-group">
              <label>تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              />
            </div>

            {pwError && (
              <div className="profile-msg profile-msg--error">{pwError}</div>
            )}

            <div className="profile-actions">
              <button
                key="save-pw"
                className="profile-btn"
                type="submit"
                disabled={pwSaving}
              >
                {pwSaving ? "جارٍ التغيير..." : "حفظ كلمة المرور"}
              </button>
              <button
                key="cancel-pw"
                className="profile-btn profile-btn--outline"
                type="button"
                onClick={closePw}
                disabled={pwSaving}
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}