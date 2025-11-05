import React, { useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/golfer/Navbar";
import { useAuthContext } from "../../context/AuthContext";
import { isStaffRole } from "../auth/roles";
import { toastBlack } from "../../components/golfer/Swal";


// map role -> path ของฝั่งผู้ใช้ทั่วไป (จริง ๆ ก็วิ่งแค่หน้าแรก)
const roleToPathUser = () => "/";

// inline notification เรียบ ๆ
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

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ type: "", message: "" });
  const [showPwd, setShowPwd] = useState(false);
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
      // เรียก login จาก context (context จะ setUser ให้)
      const res = await login({
        email: formData.email,
        password: formData.password,
      });
      const user = res?.user || res;

      // กันกรณี role ของพนักงาน/ผู้ดูแล เข้ามาที่หน้า golfer
      if (isStaffRole(user?.role)) {
        await logout(); // เคลียร์ session ที่ context เพิ่งตั้งไว้
        setNotif({
          type: "error",
          message:
            "บัญชีนี้เป็นพนักงาน/ผู้ดูแล โปรดเข้าสู่ระบบที่หน้าสำหรับพนักงาน/ผู้ดูแล",
        });
        return;
      }

      // ผ่าน: ผู้ใช้ทั่วไป
      await toastBlack("เข้าสู่ระบบสำเร็จ!", "success");
      navigate(roleToPathUser(), { replace: true });

    } catch (err) {
      console.error(err); // log ข้อผิดพลาดไว้
      setNotif({ type: "error", message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }


  };

  return (
    <>
      <Navbar />

      <Notification type={notif.type} message={notif.message} />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-800">เข้าสู่ระบบผู้ใช้ทั่วไป</h2>
            <p className="mt-2 text-sm text-gray-500">
              ยังไม่มีบัญชี?{" "}
              <Link to="/register" className="text-green-700 hover:text-green-900">
                ลงทะเบียน
              </Link>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              สำหรับพนักงาน/ผู้ดูแล{" "}
              <Link to="/staff/login" className="text-emerald-700 hover:text-emerald-900">
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

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-600 focus:border-emerald-600"
                placeholder="รหัสผ่าน"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                aria-label={showPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>


            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
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