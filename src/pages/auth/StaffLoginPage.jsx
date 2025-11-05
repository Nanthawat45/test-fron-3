import React, { useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { isStaffRole } from "../auth/roles";

// map role -> path สำหรับ staff
const roleToPathStaff = (role) => {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return "/admin";
  if (r === "starter") return "/starter";
  if (r === "caddy") return "/caddy";
  return "/notallowed";
};

function Notification({ type, message }) {
  if (!message) return null;
  const bg = type === "success" ? "bg-green-500" : "bg-red-500";
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div className={`${bg} text-white px-6 py-3 rounded-xl shadow-lg opacity-95`}>
        {message}
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ type: "", message: "" });
  const navigate = useNavigate();
  const { login, logout } = useAuthContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setNotif({ type: "error", message: "กรุณากรอกอีเมลให้ถูกต้อง" });
      return;
    }
    if ((formData.password || "").length < 8) {
      setNotif({ type: "error", message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
      return;
    }

    setLoading(true);
    setNotif({ type: "", message: "" });

    try {
      const res = await login({
        email: formData.email,
        password: formData.password,
      });
      const user = res?.user || res;

      // อนุญาตเฉพาะ staff
      if (!isStaffRole(user?.role)) {
        await logout();
        setNotif({
          type: "error",
          message: "บัญชีนี้ไม่ใช่พนักงาน/ผู้ดูแล โปรดเข้าสู่ระบบที่หน้าผู้ใช้ทั่วไป",
        });
        return;
      }

      setNotif({ type: "success", message: "เข้าสู่ระบบสำเร็จ!" });
      setTimeout(() => navigate(roleToPathStaff(user.role), { replace: true }), 700);
    } catch {
      setNotif({ type: "error", message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    } finally {
      setLoading(false);
      setFormData((p) => ({ ...p, password: "" }));
    }
  };

  return (
    <>
      <Notification type={notif.type} message={notif.message} />

      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-800">
              เข้าสู่ระบบพนักงาน/ผู้ดูแล
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              สำหรับผู้ใช้ทั่วไป{" "}
              <Link to="/login" className="text-emerald-700 hover:text-emerald-900">
                เข้าสู่ระบบที่นี่
              </Link>
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
              placeholder="อีเมล"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
              placeholder="รหัสผ่าน"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <HiOutlineDotsHorizontal className="animate-pulse h-5 w-5" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}