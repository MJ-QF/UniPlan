import axios from 'axios';

export const getApiErrorMessage = (err: unknown, fallback = 'حدث خطأ غير متوقع، حاول لاحقاً.') => {
  if (!axios.isAxiosError(err)) return fallback;
  const status = err.response?.status;
  const text = typeof err.response?.data === 'string' ? err.response.data : '';

  switch (status) {
    case 404: return 'تعذر العثور على حسابك.';
    case 409: return text || 'اسم المستخدم أو البريد مستخدم مسبقاً.';
    case 422: return text || 'بيانات غير صالحة.';
    case 401: return 'كلمة المرور الحالية غير صحيحة.';
    default:  return fallback;
  }
};