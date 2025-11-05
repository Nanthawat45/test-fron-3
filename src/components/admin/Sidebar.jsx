import { HiClipboardList, HiUserAdd, HiUserGroup } from "react-icons/hi";
import React from "react";

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-55 bg-white border-r p-4">
      <div className="mb-10">
        <img
          src="/Images/eden-Logo.png"
          alt="Logo"
          className=" mx-auto h-20 mb-1 "
        />
        <nav className="space-y-4">
          <button
            onClick={() => setActivePage("booking")}
            className={` items-center gap-2 block w-full text-left ${
              activePage === "booking"
                ? "font-bold text-[#3A4E4E]"
                : "font-medium"
            }`}
          >
            <HiClipboardList className="text-lg" />
            ข้อมูลการจอง
          </button>
          <button
            onClick={() => setActivePage("addEmployee")}
            className={` items-center gap-2 block w-full text-left ${
              activePage === "addEmployee"
                ? "font-bold text-[#3A4E4E]"
                : "font-medium"
            }`}
          >
            <HiUserAdd className="text-lg" />
            เพิ่มพนักงาน
          </button>
          <button
            onClick={() => setActivePage("employeeData")}
            className={` items-center gap-2 block w-full text-left ${
              activePage === "employeeData"
                ? "font-bold text-[#3A4E4E]"
                : "font-medium"
            }`}
          >
            <HiUserGroup className="text-lg" />
            ข้อมูลพนักงาน
          </button>
        </nav>
      </div>
    </aside>
  );
}
