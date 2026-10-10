import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/SignUp";
import AcademicRecord from "../pages/AcademicRecord";

import WishListsListPage from "../pages/wishlist/WishListsListPage";
import WishListCreatePage from "../pages/wishlist/WishListCreatePage";
import WishListDetailPage from "../pages/wishlist/WishListDetailPage";

import SchedulesListPage from "../pages/schedule/SchedulesListPage";
import ScheduleDetailPage from "../pages/schedule/ScheduleDetailPage";

/* ✅ حماية Routes — تتحقق من وجود studentId */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const studentId = localStorage.getItem("uniplan.studentId");

  if (!studentId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  /* =========================
     Public Routes (بدون Navbar)
  ========================= */
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  /* =========================
     Protected Routes (مع Navbar)
  ========================= */
  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      /* الصفحة الرئيسية → إعادة توجيه */
      {
        index: true,
        element: <Navigate to="/academic-record" replace />,
      },

      /* Academic Record */
      {
        path: "academic-record",
        element: <AcademicRecord />,
      },

      /* Wish Lists */
      {
        path: "wishlists",
        element: <WishListsListPage />,
      },
      {
        path: "wishlists/create",
        element: <WishListCreatePage />,
      },
      {
        path: "wishlists/:wishListId",
        element: <WishListDetailPage />,
      },

      /* Schedules */
      {
        path: "schedules",
        element: <SchedulesListPage />,
      },
      {
        path: "schedules/:listId/:scheduleNum",
        element: <ScheduleDetailPage />,
      },
    ],
  },

  /* Fallback */
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);