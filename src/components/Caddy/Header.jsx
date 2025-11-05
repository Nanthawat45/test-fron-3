import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

const Header = ({ currentDate }) => {
  // const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    
    <header className="bg-white shadow-md px-4 py-4 sm:py-8 flex items-center justify-between relative min-h-[150px]">
      {/* ✅ โลโก้ตรงกลาง */}
      <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-[40%] text-center select-none">
        <img
          src="/images/caddy/eden-Logo.png"
          alt="Logo"
          className="h-20 w-auto mx-auto mb-1"
        />
        <span className="block font-bold text-lg sm:text-xl">
          The Eden Golf Club
        </span>
      </div>

      {/* ✅ วันที่ */}
      {currentDate && (
        <div className="absolute right-4 top-4 bg-[#324441] text-white rounded-full px-4 py-1 text-sm select-none">
          {currentDate}
        </div>
      )}

      {/* ✅ เมนูมือถือ (ไม่มีปุ่ม/รูปแสดงผล) */}
      <div className="sm:hidden ml-auto z-50">
        <button
          className="btn btn-ghost btn-circle p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-full right-4 mt-2 bg-white border rounded-lg shadow-lg p-3 w-40 sm:hidden z-40 text-center text-gray-600">
          <p className="text-sm font-medium">เมนูยังไม่พร้อมใช้งาน</p>
        </div>
      )}
    </header>
  );
};

export default Header;
