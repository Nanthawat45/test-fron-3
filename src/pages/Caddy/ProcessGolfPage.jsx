import React, { useState, useEffect } from "react";
import Header from "../../components/Caddy/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import CaddyService from "../../service/CaddyService"; // ✅ ใช้ Service ที่ล็อกไว้แล้ว

const ProcessGolfPage = () => {
  const [step, setStep] = useState(1);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    selectedDate: stateDate,
    selectedTime: stateTime,
    bookingId: stateBookingId,
  } = location.state || {};
  const [selectedDate, _setSelectedDate] = useState(
    stateDate || localStorage.getItem("selectedDate") || "8 ก.พ ปี 2568"
  );
  const [selectedTime, _setSelectedTime] = useState(
    stateTime || localStorage.getItem("selectedTime") || "06.00"
  );
  const [bookingId, setBookingId] = useState(stateBookingId || null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (stateDate) localStorage.setItem("selectedDate", stateDate);
    if (stateTime) localStorage.setItem("selectedTime", stateTime);
  }, [stateDate, stateTime]);

  // ✅ พยายามหา bookingId ถ้าไม่ได้ส่งมาทาง state
  useEffect(() => {
    const fallbackFromMyBookings = async () => {
      if (bookingId) return;
      try {
        const { data } = await CaddyService.getCaddyBookings();
        if (Array.isArray(data) && data.length > 0) {
          // ใช้รายการแรกเป็นค่าเริ่มต้น (fallback)
          setBookingId(data[0]._id);
        }
      } catch (e) {
        // ถ้าดึงไม่ได้ก็ปล่อยไป: จะข้ามการยิง API แต่ยังให้เดินสเต็ปได้
        console.warn("ไม่พบ bookingId และไม่สามารถดึงรายการจองของแคดดี้ได้:", e);
      }
    };
    fallbackFromMyBookings();
  }, [bookingId]);

  const stepTexts = ["เริ่มออกรอบกอล์ฟ", "จบการเล่นกอล์ฟ", "เปลี่ยนแบตรถกอล์ฟสำเร็จ"];

  const handleNextStep = async () => {
    // ยิง API ตามสเต็ป (ถ้ามี bookingId) ก่อนขยับสเต็ป
    try {
      setWorking(true);

      if (step === 1) {
        // เริ่มรอบ
        if (bookingId) {
          await CaddyService.startRound(bookingId);
        } else {
          console.warn("ไม่มี bookingId: ข้ามการเรียก startRound แต่ยังไปสเต็ปถัดไป");
        }
      } else if (step === 2) {
        // จบรอบ
        if (bookingId) {
          await CaddyService.endRound(bookingId);
        } else {
          console.warn("ไม่มี bookingId: ข้ามการเรียก endRound แต่ยังไปสเต็ปถัดไป");
        }
      } else if (step === 3) {
        // ✅ สเต็ปสุดท้าย: ตั้งธง finalized ไว้ให้ HistoryPage รู้ว่า “รอบสำเร็จ”
        if (bookingId) {
          try {
            localStorage.setItem(`finalized:${bookingId}`, "1");
          } catch (e) {
            console.warn("ตั้งค่า finalized ใน localStorage ไม่สำเร็จ:", e);
          }
        }
        // แล้วค่อยกลับหน้า /caddy พร้อม state เดิม
        navigate("/caddy", {
          state: { completedSchedule: { date: selectedDate, time: selectedTime } },
        });
        return; // ออกเลย ไม่ต้องไป setStep ต่อ
      }

      if (step < 3) {
        setStep((s) => s + 1);
      }
    } catch (err) {
      console.error("ดำเนินการไม่สำเร็จ:", err);
      // คงรูปแบบง่าย ๆ ด้วย alert เพื่อไม่เปลี่ยน UI โครงสร้างเดิม
      alert(
        step === 1
          ? "เริ่มออกรอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
          : step === 2
          ? "จบการเล่นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative">
      <Header />

      {/* ✅ ปุ่ม “แจ้งปัญหา” ด้านขวาบน */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => navigate("/caddy/dashboard/start")}
          className="bg-black hover:bg-black text-white px-5 py-2 rounded-full shadow-md transition"
        >
          แจ้งปัญหา
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  step > i
                    ? "bg-green-500 border-green-500 text-white"
                    : step === i
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {step > i ? <FontAwesomeIcon icon={faCheckCircle} /> : i}
              </div>
              {i < 3 && (
                <div className="h-0.5 bg-gray-300" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <div className="bg-linear-to-br from-green-700 to-green-800 text-white rounded-3xl w-full max-w-sm py-8 px-6 text-center shadow-lg">
          <p className="text-lg font-semibold">{stepTexts[step - 1]}</p>
          <button
            className={`mt-6 bg-white text-green-800 font-medium text-sm px-8 py-2 rounded-full shadow-md hover:bg-green-50 transition ${
              working ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleNextStep}
            disabled={working}
          >
            {working ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </button>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="bg-orange-500 text-white px-5 py-2 rounded-full shadow-md hover:bg-orange-600 transition"
        >
          ยกเลิก
        </button>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-md text-center w-[80%] max-w-xs">
            <p className="text-lg font-semibold mb-4">คุณแน่ใจหรือไม่?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  navigate("/caddy");
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                ตกลง
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessGolfPage;
