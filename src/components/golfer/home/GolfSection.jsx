import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import TimelineBar from "./TimelineBar";               

export default function HeroSection() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // กดปุ่มแล้ว ถ้ามี user → ไป /booking ไม่งั้น → /register
  const handleBookingClick = () => {
    navigate(user ? "/booking" : "/register");
  };

  return (
    <section
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/golfer/Section.jpg')" }}
    >
      {/* เนื้อหาหลัก */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-16 flex flex-col justify-start h-full text-white items-center">
  <h1 className="text-3xl md:text-4xl font-en max-w-2xl text-center font-semibold leading-tight">
    {user
      ? `Welcome, ${user.name}`
      : "Great swings start with passion and precision"}
  </h1>

  <p className="mt-3 text-base md:text-lg max-w-xl text-center text-white/90">
    Find skilled candidates, in-demand jobs and the solutions you need
    to help you do your best work yet.
  </p>

        <div className="mt-7">
          {/* ใช้ปุ่มธรรมดาเพื่อไม่ต้องพึ่งคอมโพเนนต์ Button ภายนอก */}
          <button
            onClick={handleBookingClick}
            className="inline-flex items-center justify-center rounded-xl bg-white/90 text-slate-900 px-6 py-3 text-base font-semibold shadow hover:bg-white transition"
            type="button"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* แถบเวลา (วางท้าย section) */}
      <TimelineBar />
    </section>
  );
}