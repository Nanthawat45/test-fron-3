import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa'; // ไอคอนสำหรับตาเปิด/ปิด และเครื่องหมายถูก


export default function UnifiedRegisterForm({ onSubmit, loading, error, successMessage }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State สำหรับ form inputs
  const [formData, setFormData] = useState({
    fullName: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // ส่งข้อมูลฟอร์มไปยัง onSubmit callback ของ Parent Component
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    // Container หลักของฟอร์ม (จะไม่รวม header/footer ของหน้า)
    <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-10 md:p-12 w-full max-w-md mb-8">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Full Name Input */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Smith"
              className="input input-bordered w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
            {formData.fullName && (
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <FaCheckCircle className="text-green-500" />
              </span>
            )}
          </div>
        </div>

        {/* Phone or Gmail Input */}
        <div>
          <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-500 mb-1">Phone or Gmail</label>
          <div className="relative">
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              placeholder="Joydeo@gmail.com"
              className="input input-bordered w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
            {formData.emailOrPhone && (
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <FaCheckCircle className="text-green-500" />
              </span>
            )}
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-500 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input input-bordered w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-500 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="input input-bordered w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* แสดง Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        {/* แสดง Success Message */}
        {successMessage && (
          <p className="text-green-500 text-sm text-center mt-2">{successMessage}</p>
        )}

        {/* Sign Up Button */}
        <button
          type="submit"
          className="btn w-full bg-linear-to-br from-[#7B004F] via-[#B2006F] to-[#FC4445] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-[#FC4445] hover:to-[#B2006F] transition-all duration-300 ease-in-out text-lg"
          disabled={loading} // ปิดการใช้งานปุ่มเมื่อกำลังโหลด
        >
          {loading ? 'Registering...' : 'SIGN UP'}
        </button>
      </form>
    </div>
  );
}