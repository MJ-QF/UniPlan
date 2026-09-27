import { useEffect, useState } from 'react';
import { getCourses } from './api/courses';
import type { Course } from './api/courses';
function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCourses()
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('حدث خطأ أثناء الاتصال بالباك إند');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ direction: 'rtl', fontFamily: 'sans-serif', padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>نظام تخطيط المقررات - UniPlan</h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>قائمة المقررات المتاحة من قاعدة البيانات</p>
      </header>

      {loading && <p style={{ fontSize: '18px', color: '#0284c7' }}>جاري جلب البيانات من السيرفر...</p>}

      {error && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {courses.map((course) => (
            <div
              key={course.courseID}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6366f1', backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '4px' }}>
                  {course.courseCode}
                </span>
                <h3 style={{ margin: '12px 0 8px 0', color: '#0f172a' }}>{course.courseName}</h3>
                <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                  عدد الساعات المعتمدة: <strong>{course.creditHours}</strong>
                </p>
              </div>
              <button
                style={{
                  marginTop: '15px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                إضافة للجدول
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;