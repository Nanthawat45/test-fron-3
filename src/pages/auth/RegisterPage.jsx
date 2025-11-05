import React, { useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/golfer/Navbar";

import UserService from "../../service/userService"; 

const Notification = ({ type, message }) => {
  if (!message) return null;
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-3 opacity-95 transition-all duration-300`}>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!passwordPattern.test(formData.password)) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร, ตัวใหญ่, ตัวเล็ก และตัวเลข");
      return;
    }

    setLoading(true);
    try {
      const res = await UserService.registerUser({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role, // เผื่อ backend ต้องการ
      });

      const data = res?.data ?? res;
      if (data?.success === false) {
        setError(data?.message || "ลงทะเบียนไม่สำเร็จ");
      } else {
        setSuccess(data?.message || "ลงทะเบียนสำเร็จ!");
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "name", placeholder: "ชื่อ", type: "text" },
    { name: "phone", placeholder: "เบอร์โทรศัพท์", type: "tel" },
    { name: "email", placeholder: "ที่อยู่อีเมล", type: "email" },
    { name: "password", placeholder: "รหัสผ่าน", type: "password" },
    { name: "confirmPassword", placeholder: "ยืนยันรหัสผ่าน", type: "password" },
  ];

  return (
    <>
      <Navbar />

      {/* Notifications */}
      <Notification type={error ? "error" : ""} message={error} />
      <Notification type={success ? "success" : ""} message={success} />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-mono">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl font-medium text-gray-800 tracking-wide">
              ลงทะเบียน
            </h2>
            <p className="mt-2 text-sm text-gray-500">สร้างบัญชีใหม่เพื่อเริ่มต้น</p>
            <p className="mt-1 text-sm text-gray-500">
              หรือ{" "}
              <Link to="/login" className="font-mono text-green-700 hover:text-black transition-colors duration-200">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {inputFields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="sr-only">{field.placeholder}</label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.type === "password" ? "new-password" : "on"}
                  required
                  className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 transition-all duration-200"
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-mono rounded-lg text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <HiOutlineDotsHorizontal className="animate-pulse h-5 w-5" />
                  <span>กำลังดำเนินการ...</span>
                </div>
              ) : (
                "ลงทะเบียน"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}