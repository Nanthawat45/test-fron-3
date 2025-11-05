import { HiClipboardList, HiUserAdd, HiUserGroup } from "react-icons/hi";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../service/userService";

export default function HeaderCaddy({ activePage }) {
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pageData = {
    employeeData: {
      title: "ข้อมูลพนักงาน",
      icon: <HiUserGroup className="inline mr-2 text-lg" />,
    },
    booking: {
      title: "ข้อมูลการจอง",
      icon: <HiClipboardList className="inline mr-2 text-lg" />,
    },
    addEmployee: {
      title: "เพิ่มพนักงาน",
      icon: <HiUserAdd className="inline mr-2 text-lg" />,
    },
  };

  const current = pageData[activePage] || {};

  // ✅ ปิดเมนูเมื่อคลิกนอก avatar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = async (menu) => {
    if (menu === "โปรไฟล์") navigate("/caddy/profile");
    else if (menu === "ประวัติการทำงาน") navigate("/caddy/history");
    else if (menu === "แจ้งปัญหา") navigate("/caddy/dashboard");
    else if (menu === "ออกจากระบบ") {
      try {
        await UserService.logoutUser();
      } catch (err) {
        console.warn("Logout error:", err);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/");
    }

    setIsMenuOpen(false);
  };

  return (
    <header className="flex justify-between items-center mb-6 bg-[#3A4E4E] p-4 rounded text-white relative">
      <h1 className="text-xl font-bold flex items-center">
        {current.icon}
        {current.title || "หน้าหลักแคดดี้"}
      </h1>

      {/* ✅ โปรไฟล์แคดดี้ */}
      <div className="relative" ref={profileRef}>
        <div
          className="avatar avatar-online avatar-placeholder cursor-pointer flex items-center gap-2"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          {/* <div className="bg-[#E3F1EB] text-[#324441] w-10 h-10 rounded-full flex items-center justify-center font-semibold">
            CD
          </div> */}
          <span className="font-medium">Admin</span>
        </div>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 text-gray-700 z-50">
            <button
              onClick={() => handleMenuClick("โปรไฟล์")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              โปรไฟล์
            </button>
            <button
              onClick={() => handleMenuClick("ประวัติการทำงาน")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              ประวัติการทำงาน
            </button>
            <button
              onClick={() => handleMenuClick("แจ้งปัญหา")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              แจ้งปัญหา
            </button>
            <button
              onClick={() => handleMenuClick("ออกจากระบบ")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </header>
  );
}