import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import { useNavigate } from "react-router-dom"; // ✅ เพิ่มบรรทัดนี้

registerLocale("th", th);

const LandingPage = () => {
  const selectedDate = new Date();
  const navigate = useNavigate(); // ✅ ใช้งาน hook สำหรับนำทาง

  return (
    <div className="min-h-screen bg-white p-4 font-sans relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 text-center space-y-2">
          <img src="/images/caddy/eden-Logo.png" alt="logo" className="mx-auto h-24" />
          <h1 className="text-black text-lg font-bold uppercase">The Eden Golf Club</h1>
        </div>

        {/* ✅ ปุ่มเข้าสู่ระบบ เด้งไปหน้า /login */}
        <button
          onClick={() => navigate("/login")}
          className="bg-[#324441] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-opacity-90"
        >
          เข้าสู่ระบบ
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={() => {}}
          dateFormat="d MMM ปี yyyy"
          locale="th"
          className="bg-[#3B6B5D] text-white rounded-full px-4 py-1 text-sm cursor-pointer text-center"
          disabled
        />
      </div>

      <div className="bg-[#3B6B5D] text-white text-center rounded-2xl py-4 px-6 mx-auto w-[85%] space-y-2 mb-6">
        <h2 className="text-base font-bold">เวลาออกรอบกอล์ฟ</h2>
        <div className="flex justify-center gap-6">
          <p className="text-gray-200">-</p>
        </div>
      </div>

      <div className="bg-white mx-auto w-[90%] rounded-2xl shadow-md overflow-hidden mb-6">
        <div className="bg-[#3B6B5D] text-white text-center py-3">
          <h2 className="text-lg font-bold">การทำงานรายสัปดาห์</h2>
        </div>
        <table className="w-full text-center text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">วันที่</th>
              <th className="p-2">รอบเช้า</th>
              <th className="p-2">รอบบ่าย</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2">-</td>
              <td className="p-2">-</td>
              <td className="p-2">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6 mb-6">
        <h3 className="text-red-500 font-bold text-lg md:text-xl text-center">*กรุณาเข้าสู่ระบบ</h3>
      </div>
    </div>
  );
};

export default LandingPage;
