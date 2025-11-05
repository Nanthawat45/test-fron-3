import React from "react";
import { Outlet } from "react-router-dom";

// Layout บางเบาไว้หุ้มหน้าของฝั่ง caddie
// (ถ้าอยากวาง Header กลางทุกหน้า ค่อยย้าย Header มาลงตรงนี้ได้)
export default function CaddieLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}
