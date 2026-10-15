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

import CourseOfferingsPage from "../pages/course-offerings/CourseOfferingsPage";

/* ✅ حماية Routes */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const studentId = localStorage.getItem("uniplan.studentId");
  const adminId = localStorage.getItem("uniplan.adminId");

  if (!studentId && !adminId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  /* Public */
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  /* Protected */
  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      /* Redirect based on role */
      {
        index: true,
        element: <Navigate to="/academic-record" replace />,
      },

      /* Student Routes */
      {
        path: "academic-record",
        element: <AcademicRecord />,
      },
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
      {
        path: "schedules",
        element: <SchedulesListPage />,
      },
      {
        path: "schedules/:listId/:scheduleNum",
        element: <ScheduleDetailPage />,
      },

      /* Admin Routes */
      {
        path: "course-offerings",
        element: <CourseOfferingsPage />,
      },

      /* Shared Routes */
      {
        path: "profile",
        element: (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <h2 style={{ color: "#0b1a20" }}>الملف الشخصي</h2>
            <p style={{ color: "#516770" }}>قريباً...</p>
          </div>
        ),
      },
    ],
  },

  /* Fallback */
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);