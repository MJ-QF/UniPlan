import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import './LoginPage.css';

export default function LoginPage() {
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!accountName || !password) {
      setErrorMessage('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5260/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountName,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('نجاح تسجيل الدخول:', data);
        // توجيه المستخدم لاحقاً حسب الـ Role
      } else {
        if (response.status === 401) {
          setErrorMessage('اسم المستخدم أو كلمة المرور غير صحيحة');
        } else if (response.status === 422) {
          setErrorMessage('البيانات المدخلة غير مكتملة أو غير صالحة');
        } else if (response.status === 409) {
          setErrorMessage('يوجد تعارض في البيانات');
        } else {
          setErrorMessage('حدث خطأ في الخادم، يرجى المحاولة لاحقاً');
        }
      }
    } catch (error) {
      setErrorMessage('تعذر الاتصال بالخادم، يرجى التأكد من تشغيل الباك إند.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* القسم الأيمن - الشعار والمميزات */}
      <div className="login-brand-section">
        <div className="brand-content">
          <div className="brand-logo-container">
            <span className="brand-logo-text">UniPlan</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
            منصة متكاملة لإدارة جداولك الدراسية واختيار موادك الأكاديمية بكل سهولة ويسر
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

      {/* القسم الأيسر - نموذج تسجيل الدخول */}
      <div className="login-form-section">
        <div className="form-card">
          <div className="form-header">
            <h2 className="form-title">تسجيل الدخول</h2>
            <p className="form-subtitle">مرحباً بعودتك! أدخل بياناتك للمتابعة</p>
          </div>

          {errorMessage && (
            <div className="login-alert-error">
              {errorMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="accountName">اسم المستخدم</label>
              <input
                id="accountName"
                type="text"
                className="form-input"
                placeholder="أدخل اسم المستخدم"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">كلمة المرور</label>
              <div className="input-relative-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="form-footer-link">
  ليس لديك حساب؟
  <Link to="/register" className="register-link">إنشاء حساب</Link>
</div>
        </div>
      </div>
    </div>
  );
}