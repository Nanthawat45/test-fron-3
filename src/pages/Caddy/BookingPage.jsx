import React, { useState, useEffect, useRef } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faExclamation, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import th from "date-fns/locale/th";
import CaddyService from "../../service/CaddyService";
import UserService from "../../service/userService";

registerLocale("th", th);

const formatDateThai = (date) => {
  const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const day = date.getDate();
  const month = thMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

const dateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toLocalDate = (isoStr) => {
  const d = new Date(isoStr);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [golfTimes, setGolfTimes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [timesByDate, setTimesByDate] = useState({});
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [completedKeySet, setCompletedKeySet] = useState(new Set());

  // โหลดข้อมูล
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await CaddyService.getCaddyBookings();
        const data = Array.isArray(res?.data) ? res.data : [];
        if (!mounted) return;

        const map = {};
        const completedKeys = new Set();

        for (const b of data) {
          if (!b?.date || !b?.timeSlot) continue;
          const dk = dateKey(toLocalDate(b.date));
          if (!map[dk]) map[dk] = [];
          map[dk].push(b.timeSlot);

          if (String(b.status).toLowerCase() === "completed") {
            completedKeys.add(`${dk}|${String(b.timeSlot)}`);
          }
        }

        Object.keys(map).forEach((k) => {
          map[k].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
        });

        setBookings(data);
        setTimesByDate(map);
        setCompletedKeySet(completedKeys);
        setCheckingAuth(false);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          const from = location.pathname + location.search;
          navigate(`/login?from=${encodeURIComponent(from)}`, { replace: true });
          return;
        }
        setCheckingAuth(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate, location]);

  // ปิดเมนูเมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ตารางรายสัปดาห์
  useEffect(() => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const key = dateKey(currentDate);
      const times = timesByDate[key] || [];
      days.push({
        date: formatDateThai(currentDate),
        rawDate: currentDate,
        times,
      });
    }
    setWeeklySchedule(days);
  }, [selectedDate, timesByDate]);

  // อัปเดตปุ่มเวลาตามวันที่ที่เลือก
  useEffect(() => {
    const key = dateKey(selectedDate);
    setGolfTimes(timesByDate[key] || []);
  }, [selectedDate, timesByDate]);

  // === ช่วยเช็กเวลาปัจจุบันขึ้นไป ===
  const parseTime = (str) => {
    if (!str) return { h: 0, m: 0 };
    const s = String(str).trim();
    const [hh, mm = "0"] = s.includes(":") ? s.split(":") : s.split(".");
    return { h: Number(hh), m: Number(mm) };
  };

  const isPastTimeSlot = (dateObj, timeStr) => {
    const now = new Date();
    const daySel = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const dayNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (daySel.getTime() < dayNow.getTime()) return true;
    if (daySel.getTime() > dayNow.getTime()) return false;

    const { h, m } = parseTime(timeStr);
    const slot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    return slot.getTime() < now.getTime();
  };

  const handleTimeClick = (time) => {
    const keySel = dateKey(selectedDate);
    const found = bookings.find(
      (b) => dateKey(toLocalDate(b.date)) === keySel && String(b.timeSlot) === String(time)
    );

    if (found && String(found.status).toLowerCase() === "completed") return;

    const bookingId = found?._id || null;

    navigate("/caddy/process", {
      state: {
        selectedDate: formatDateThai(selectedDate),
        selectedTime: time,
        bookingId,
      },
    });
  };

const handleMenuClick = async (menu) => {
  if (menu === "โปรไฟล์") {
    navigate("/caddy/profile");
  } else if (menu === "ประวัติการทำงาน") {
    navigate("/caddy/history");
  } else if (menu === "แจ้งปัญหา") {
    navigate("/caddy/dashboard");
  } else if (menu === "ออกจากระบบ") {
    try {
      await UserService.logoutUser();
    } catch (err) {
      console.warn("Logout error:", err);
    }

    // ✅ หน่วงเวลา 1 วินาทีก่อนรีเฟรช
          localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/"); // <-- แก้เป็น 1500, 2000 ก็ได้ถ้าอยากหน่วงมากกว่านี้
  }

  setIsMenuOpen(false);
};

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="loading loading-spinner loading-lg text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 text-center space-y-2">
          <img src="/images/caddy/eden-Logo.png" alt="logo" className="mx-auto h-24" />
          <h1 className="text-[#324441] text-xl font-bold uppercase">The Eden Golf Club</h1>
        </div>

        <div className="relative z-10 self-start" ref={profileRef}>
          <div
            className="avatar avatar-online avatar-placeholder cursor-pointer"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <div className="bg-[#324441] text-white w-12 h-12 rounded-full flex items-center justify-center">
              <span className="text-lg">AI</span>
            </div>
          </div>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
              <button onClick={() => handleMenuClick("โปรไฟล์")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">โปรไฟล์</button>
              <button onClick={() => handleMenuClick("ประวัติการทำงาน")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">ประวัติการทำงาน</button>
              <button onClick={() => handleMenuClick("แจ้งปัญหา")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">แจ้งปัญหา</button>
              <button onClick={() => handleMenuClick("ออกจากระบบ")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">ออกจากระบบ</button>
            </div>
          )}
        </div>
      </div>

      {/* DatePicker */}
      <div className="flex justify-center mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="d MMM ปี yyyy"
          locale="th"
          minDate={new Date()}
          className="bg-[#324441] text-white rounded-full px-4 py-2 text-sm cursor-pointer text-center"
        />
      </div>

      {/* เวลาออกรอบกอล์ฟ */}
      <div className="bg-[#3B6B5D] text-white text-center rounded-2xl shadow-lg py-6 px-6 mx-auto w-full max-w-sm space-y-4 mb-6">
        <h2 className="text-base font-bold">เวลาออกรอบกอล์ฟ</h2>
        <div className="flex justify-center gap-6 flex-wrap">
          {golfTimes.length > 0 ? (
            golfTimes.map((time) => {
              const isCompleted = completedKeySet.has(`${dateKey(selectedDate)}|${String(time)}`);
              const isPast = isPastTimeSlot(selectedDate, time);
              const disabled = isCompleted || isPast;

              return (
                <button
                  key={time}
                  onClick={() => !disabled && handleTimeClick(time)}
                  disabled={disabled}
                  className={`rounded-full px-4 py-1 text-sm font-semibold border border-white transition-colors ${
                    disabled
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "text-white hover:bg-white hover:text-[#324441]"
                  }`}
                >
                  {isCompleted ? "คุณจบรอบแล้ว" : time}
                </button>
              );
            })
          ) : (
            <span className="text-sm opacity-80">— ไม่มีเวลางานสำหรับวันนี้ —</span>
          )}
        </div>
      </div>

      {/* ตารางรายสัปดาห์ */}
      <div className="bg-[#E3F1EB] mx-auto w-full max-w-sm rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="bg-[#3B6B5D] text-white text-center py-4">
          <h2 className="text-xl font-bold">การทำงานรายสัปดาห์</h2>
        </div>
        <table className="w-full text-center text-sm">
          <thead className="bg-gray-300">
            <tr>
              <th className="p-2 w-1/2">วันที่</th>
              <th className="p-2 w-1/2">เวลาเริ่มงาน</th>
            </tr>
          </thead>
          <tbody>
            {weeklySchedule.map((day) => {
              const timesText = (day.times && day.times.length > 0) ? day.times.join(", ") : "-";
              return (
                <tr key={day.date} className="border-t border-gray-400">
                  <td className="p-2 w-1/2">{day.date}</td>
                  <td className="p-2 w-1/2">{timesText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingPage;
