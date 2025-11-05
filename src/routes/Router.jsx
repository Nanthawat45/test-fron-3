import React from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// Golfer pages
import GolferHomePage from "../pages/golfer/GolferHomePage";
import GolferBookingPage from "../pages/golfer/GolferBookingPage";
import ProfilePage from "../pages/golfer/ProfilePage";
import CheckoutSuccess from "../pages/golfer/CheckoutSuccess";
import UnauthorizedPage from "../pages/golfer/UnauthorizedPage";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import StaffLoginPage from "../pages/auth/StaffLoginPage";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import BookingTable from "../pages/admin/BookingTable";
import EmployeeDetail from "../pages/admin/EmployeeDetail";
import EmployeeForm from "../pages/admin/EmployeeForm";
import EmployeePage from "../components/admin/EmployeePage";

// Starter pages (protected)
import StarterLayout from "../layout/starterLayout";
import StarterDashboard from "../pages/starter/Dashboard";
import StarterReportPage from "../pages/starter/ReportPage";
import ReportConfirmPage from "../pages/starter/ReportConfirmPage";

// Caddie pages (protected)  ⬅️ เพิ่มจาก caddieRouter
import CaddieLayout from "../layout/caddieLayout";
import LandingPage from "../pages/Caddy/LandingPage";
import BookingPage from "../pages/Caddy/BookingPage";
import CaddyProfile from "../pages/Caddy/CaddyProfile";
import HistoryPage from "../pages/Caddy/HistoryPage";
import ProcessGolfPage from "../pages/Caddy/ProcessGolfPage";
import CaddieDashboard from "../pages/Caddy/Dashboard";
import DashboardStart from "../pages/Caddy/DashboardStart";

// ---- Role guard (reusable) ----
function RequireRole({ allowed = [], children }) {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: "auth" }}
      />
    );
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to="/unauthorized" replace state={{ reason: "role" }} />;
  }

  return children;
}

// ---- Unified Router ----
const Router = createBrowserRouter([
  // Public / Golfer (เดิม)
  { path: "/", element: <GolferHomePage /> },
  { path: "/booking", element: <GolferBookingPage /> },
  { path: "/booking/success", element: <CheckoutSuccess /> },
  { path: "/profile", element: <ProfilePage /> },

  // Auth (เดิม)
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/staff/login", element: <StaffLoginPage /> },

  // Unauthorized (เดิม)
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  // Starter (protected) (เดิม)
  {
    path: "/starter",
    element: (
      <RequireRole allowed={["starter"]}>
        <StarterLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <StarterDashboard /> },       // /starter
      { path: "dashboard", element: <StarterDashboard /> }, // /starter/dashboard
      { path: "report", element: <StarterReportPage /> },   // /starter/report
      { path: "report/confirm", element: <ReportConfirmPage /> },
    ],
  },

  // Caddie (protected)  ⬅️ นำมาจาก caddieRouter (แทนที่ redirect เดิม)
  {
    element: (
      <RequireRole allowed={["caddy"]}>
        <CaddieLayout />
      </RequireRole>
    ),
    children: [
      { path: "/landing", element: <LandingPage /> },
      { path: "/caddy", element: <BookingPage /> },
      { path: "/caddy/booking", element: <BookingPage /> },
      { path: "/caddy/profile", element: <CaddyProfile /> },
      { path: "/caddy/history", element: <HistoryPage /> },
      { path: "/caddy/process", element: <ProcessGolfPage /> },
      { path: "/caddy/dashboard", element: <CaddieDashboard /> },
      { path: "/caddy/dashboard/start", element: <DashboardStart /> },
    ],
  },

  // Admin (protected) (เดิม)
  {
    path: "/admin",
    element: (
      <RequireRole allowed={["admin", "starter", "caddy"]}>
        <AdminDashboard />
      </RequireRole>
    ),
    children: [
      { index: true, element: <EmployeePage /> },
      { path: "booking", element: <BookingTable /> },
      { path: "add", element: <EmployeeForm /> },
      { path: "detail/:id", element: <EmployeeDetail /> },
    ],
  },

  // Fallback (เดิม)
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default Router;