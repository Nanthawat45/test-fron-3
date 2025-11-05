import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faStar,
  faLocationDot,
  faChevronDown,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import CaddyService from "../../service/caddyService";

const toThaiDate = (iso) => {
  try {
    const d = new Date(iso);
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch {
    return iso;
  }
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [holesFilter, setHolesFilter] = useState("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isHolesDropdownOpen, setIsHolesDropdownOpen] = useState(false);
  const [isRoundsDropdownOpen, setIsRoundsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await CaddyService.getCaddyBookings();
        const rows = (Array.isArray(data) ? data : []).map((b) => {
          // อ่านสถานะจาก backend
          const backendStatus = String(b?.status || "").toLowerCase();
          // จะนับเป็น "completed" ก็ต่อเมื่อมี flag ที่ตั้งหลังสเต็ป 3 เท่านั้น
          const finalized = localStorage.getItem(`finalized:${b?._id}`) === "1";

          let status = "pending"; // ค่าเริ่มต้น = ยังไม่จัดเป็นรอบสำเร็จ
          if (backendStatus === "canceled") status = "canceled";
          else if (backendStatus === "completed" && finalized) status = "completed";

          return {
            id: b._id,
            date: toThaiDate(b.date),
            time: b.timeSlot || "-",
            customer: b.groupName || "-",
            status,                    // <- ใช้สถานะตามเงื่อนไขด้านบน
            isRepeatCustomer: false,   // ยังไม่มีข้อมูลจาก service
            holes: b.courseType ? parseInt(b.courseType) : undefined,
            cancellationReason: "",
          };
        });
        setHistory(rows);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredHistory = history.filter((item) => {
    const s = (searchTerm || "").toLowerCase();
    const matchSearch =
      item.date.toLowerCase().includes(s) ||
      item.customer.toLowerCase().includes(s) ||
      item.status.toLowerCase().includes(s);

    let matchFilter = true;
    if (filter === "completed" && item.status !== "completed") matchFilter = false;
    if (filter === "canceled" && item.status !== "canceled") matchFilter = false;
    if (filter === "repeatCustomer" && !item.isRepeatCustomer) matchFilter = false;

    let matchHoles = true;
    if (holesFilter !== "all" && item.holes !== parseInt(holesFilter)) matchHoles = false;

    return matchSearch && matchFilter && matchHoles;
  });

  const completedRounds = history.filter((i) => i.status === "completed").length;

  const getFilterLabel = () => {
    switch (filter) {
      case "completed":
      case "canceled":
        return "การออกรอบ";
      case "repeatCustomer":
        return "ลูกค้าประจำ";
      default:
        return "ทั้งหมด";
    }
  };

  const getHolesLabel = () => {
    if (holesFilter === "9") return "9 หลุม";
    if (holesFilter === "18") return "18 หลุม";
    return "จำนวนหลุม";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-linear-to-r from-teal-600 via-indigo-600 to-purple-600 text-white py-4 rounded-b-xl shadow-md flex justify-center items-center mb-6">
          <h1 className="text-white text-2xl font-bold uppercase">ประวัติการทำงาน</h1>
        </div>

        <div className="flex justify-start items-center mt-6 mb-6">
          <button onClick={() => navigate(-1)} className="text-[#324441] text-lg font-bold">
            &lt; ย้อนกลับ
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 text-center shadow-md">
          <h2 className="text-lg font-semibold text-[#324441]">สรุปผลการทำงาน</h2>
          <div className="flex justify-around mt-4">
            <div>
              <p className="text-xl font-bold text-gray-800">{history.length}</p>
              <p className="text-sm text-gray-500">รอบทั้งหมด</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{completedRounds}</p>
              <p className="text-sm text-gray-500">รอบสำเร็จ</p>
            </div>
          </div>
        </div>

        {/* Mobile filters */}
        <div className="flex flex-row space-x-2 md:hidden w-full mb-6">
          <div className="relative flex-1">
            <button
              onClick={() => setIsFilterDropdownOpen((v) => !v)}
              className="w-full px-4 py-2 rounded-full text-sm font-semibold bg-[#324441] text-white flex items-center justify-between"
            >
              {getFilterLabel()}
              <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 ml-2" />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <button
                  onClick={() => { setFilter("all"); setIsFilterDropdownOpen(false); setIsRoundsDropdownOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ทั้งหมด
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsRoundsDropdownOpen((v) => !v)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center"
                  >
                    การออกรอบ <FontAwesomeIcon icon={faChevronDown} className={`h-3 w-3 ${isRoundsDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isRoundsDropdownOpen && (
                    <div className="bg-gray-50">
                      <button
                        onClick={() => { setFilter("completed"); setIsFilterDropdownOpen(false); setIsRoundsDropdownOpen(false); }}
                        className="block w-full text-left pl-8 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        - รอบสำเร็จ
                      </button>
                      <button
                        onClick={() => { setFilter("canceled"); setIsFilterDropdownOpen(false); setIsRoundsDropdownOpen(false); }}
                        className="block w-full text-left pl-8 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        - รอบยกเลิก
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setFilter("repeatCustomer"); setIsFilterDropdownOpen(false); setIsRoundsDropdownOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ลูกค้าประจำ
                </button>
              </div>
            )}
          </div>

          <div className="relative flex-1">
            <button
              onClick={() => setIsHolesDropdownOpen((v) => !v)}
              className="w-full px-4 py-2 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 flex items-center justify-between"
            >
              {getHolesLabel()}
              <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 ml-2" />
            </button>
            {isHolesDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <button onClick={() => { setHolesFilter("all"); setIsHolesDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                  ทั้งหมด
                </button>
                <button onClick={() => { setHolesFilter("9"); setIsHolesDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                  9 หลุม
                </button>
                <button onClick={() => { setHolesFilter("18"); setIsHolesDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                  18 หลุม
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop filters */}
        <div className="hidden md:flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => { setFilter("all"); setSearchTerm(""); setHolesFilter("all"); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              filter === "all" ? "bg-[#324441] text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            ทั้งหมด
          </button>

          <div className="relative">
            <button
              onClick={() => setIsRoundsDropdownOpen((v) => !v)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                filter === "completed" || filter === "canceled"
                  ? "bg-[#324441] text-white"
                  : "bg-gray-200 text-gray-700"
              } flex items-center gap-2`}
            >
              การออกรอบ
              <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
            </button>
            {isRoundsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <button
                  onClick={() => { setFilter("completed"); setSearchTerm(""); setHolesFilter("all"); setIsRoundsDropdownOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  รอบสำเร็จ
                </button>
                <button
                  onClick={() => { setFilter("canceled"); setSearchTerm(""); setHolesFilter("all"); setIsRoundsDropdownOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  รอบยกเลิก
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => { setFilter("repeatCustomer"); setSearchTerm(""); setHolesFilter("all"); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              filter === "repeatCustomer" ? "bg-[#324441] text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            ลูกค้าประจำ
          </button>

          <div className="relative">
            <button
              onClick={() => setIsHolesDropdownOpen((v) => !v)}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 flex items-center gap-2"
            >
              จำนวนหลุม
              <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
            </button>
            {isHolesDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <button onClick={() => { setHolesFilter("all"); setIsHolesDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                  ทั้งหมด
                </button>
                <button onClick={() => { setHolesFilter("9"); setIsHolesDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                  9 หลุม
                </button>
                <button onClick={() => { setHolesFilter("18"); setIsHolesDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                  18 หลุม
                </button>
              </div>
            )}
          </div>

          <div className="relative ml-auto">
            <label className="input input-bordered flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <FontAwesomeIcon icon={faSearch} className="h-4 w-4 opacity-50" />
              <input
                type="search"
                placeholder="ค้นหา"
                className="grow w-full text-gray-700 bg-transparent outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setFilter("all"); }}
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((h) => (
              <div key={h.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center text-lg font-semibold text-[#324441]">
                  <span>{h.date}</span>
                  <span className="text-gray-600">{h.time}</span>
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  <p>ลูกค้า: {h.customer}</p>
                  {h.isRepeatCustomer && (
                    <p className="text-yellow-500 text-xs mt-1">
                      <FontAwesomeIcon icon={faStar} className="mr-1" />
                      ลูกค้าประจำ
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-semibold text-gray-700">
                    {h.status === "completed"
                      ? "สถานะ: สำเร็จ"
                      : h.status === "canceled"
                      ? "สถานะ: ยกเลิก"
                      : "สถานะ: กำลังดำเนินการ"}
                  </span>
                  <div className="flex items-center space-x-2">
                    {h.holes && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-gray-400" />
                        <span>{h.holes} หลุม</span>
                      </div>
                    )}
                    {h.status === "completed" ? (
                      <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-xl" />
                    ) : h.status === "canceled" ? (
                      <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 text-xl" />
                    ) : null}
                  </div>
                </div>
                {h.status === "canceled" && h.cancellationReason && (
                  <p className="text-red-500 text-xs mt-2 italic">เหตุผล: {h.cancellationReason}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10">ไม่มีประวัติการทำงานที่ตรงกับตัวกรอง</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
