import React from "react";

export default function EmployeeCard({ employee, onClick }) {
  return (
    <div
      onClick={() => onClick(employee)}
      className="cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-transform bg-white border border-gray-200 w-full max-w-xs mx-auto flex-none hover:scale-[1.02]"
    >
      <div className="p-4 flex flex-col items-center text-center">
        <img
          src={employee.img || "/Images/Profile.jpg"}
          alt={employee.name}
          className="rounded-full w-24 h-24 mb-3 shadow object-cover"
        />
        <p className="mb-1 text-sm">
          <span className="font-semibold text-gray-700">ชื่อ: </span>
          <span className="text-gray-800">{employee.name}</span>
        </p>
        <p className="text-sm">
          <span className="font-semibold text-gray-700">ตำแหน่ง: </span>
          <span className="text-gray-800 capitalize">{employee.role}</span>
        </p>
      </div>
    </div>
  );
}
