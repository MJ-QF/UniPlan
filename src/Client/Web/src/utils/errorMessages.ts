import axios from "axios";

/* =========================
   User-Friendly Error Messages
   ترجمة رسائل الباك لرسائل بسيطة للمستخدم
========================= */

export function getScheduleErrorMessage(error: unknown): string {
  /* Axios errors */
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    /* 422 - Validation errors */
    if (status === 422) {
      const text = typeof data === "string" ? data : "";

      /* تعارض في جدولة المواد */
      if (
        text.includes("غير موجهة") ||
        text.includes("محاضرات")
      ) {
        return "لم نتمكن من جدولة بعض المواد في الأوقات المختارة. جرّب توسيع نطاق الأوقات أو الأيام.";
      }

      /* قائمة فاضية */
      if (
        text.includes("فارغة") ||
        text.includes("لا توجد مواد")
      ) {
        return "القائمة لا تحتوي على مواد. أضف مواد أولاً.";
      }

      /* متطلبات سابقة */
      if (
        text.includes("المتطلبات") ||
        text.includes("السابقة")
      ) {
        return "بعض المواد لها متطلبات سابقة غير مكتملة.";
      }

      /* رسالة عامة */
      return "لا يمكن إنشاء الجدول بهذي الإعدادات. جرّب تعديل الأيام أو الأوقات.";
    }

    /* 409 - Conflict */
    if (status === 409) {
      return "يوجد جدول لهذه القائمة بالفعل.";
    }

    /* 400 - Bad Request */
    if (status === 400) {
      return "البيانات المدخلة غير صحيحة. تأكد من الأيام والأوقات.";
    }

    /* 404 - Not Found */
    if (status === 404) {
      return "القائمة غير موجودة.";
    }

    /* 500 - Server Error */
    if (status === 500) {
      return "حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.";
    }

    /* Network */
    if (error.code === "ERR_NETWORK") {
      return "تعذر الاتصال بالخادم. تأكد من تشغيل النظام.";
    }
  }

  /* رسالة عامة */
  return "تعذر إنشاء الجدول. حاول مرة أخرى.";
}