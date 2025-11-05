import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Step1 from "../../components/golfer/booking/Step1";
import Step2 from "../../components/golfer/booking/Step2";
import Step3 from "../../components/golfer/booking/Step3";
import Step4 from "../../components/golfer/booking/Step4";
import { calculateTotalPrice } from "../../service/calculatePrice";
import StripeService from "../../service/stripeService"; 
import Navbar from "../../components/golfer/Navbar";

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function GolferBookingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // ✅ ถ้า Stripe ส่งกลับ /booking?session_id=... ให้เด้งไป /booking/success ทันที
  useEffect(() => {
    const sid = params.get("session_id") || params.get("sessionId");
    if (sid) {
      navigate(`/booking/success?session_id=${encodeURIComponent(sid)}`, { replace: true });
    }
  }, [params, navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    courseType: "18",
    date: formatDate(new Date()),
    timeSlot: "",
    players: 1,
    groupName: "",
    caddy: [],
    golfCartQty: 0,
    golfBagQty: 0,
    totalPrice: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // sync total ราคา
  useEffect(() => {
    const total = calculateTotalPrice(bookingData);
    if (bookingData.totalPrice !== total) {
      setBookingData((prev) => ({ ...prev, totalPrice: total }));
    }
  }, [bookingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: ["players", "golfCartQty", "golfBagQty"].includes(name) ? parseInt(value) : value,
    }));
  };

  // ⬇️ เปลี่ยนมาเรียก StripeService.createCheckout → redirect ไป Stripe
  const handleSubmitBooking = async () => {
  try {
    setIsLoading(true);

    const payload = {
      ...bookingData,
      totalPrice: calculateTotalPrice(bookingData),
      date: formatDate(bookingData.date), // YYYY-MM-DD
    };

    // ✅ เก็บร่างการจองเอาไว้ก่อนออกไป Stripe
    sessionStorage.setItem("bookingDraft", JSON.stringify(payload));
    // (ถ้ามีจอรีวิวราคา/รายละเอียด) เก็บ snapshot ที่คุณใช้โชว์หน้าสำเร็จ
    sessionStorage.setItem("bookingPreview", JSON.stringify({
      ...payload,
      price: {
        total: calculateTotalPrice(bookingData),
        // เติม breakdown ถ้ามี
      }
    }));

    const resp = await StripeService.createCheckout(payload);
    const data = resp?.data ?? resp;
    const paymentUrl = data?.paymentUrl || data?.url;
    if (!paymentUrl) throw new Error(data?.message || "ไม่พบลิงก์ชำระเงินจากเซิร์ฟเวอร์");

    window.location.assign(paymentUrl);
  } catch (err) {
    alert(err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาดในการสร้างการชำระเงิน");
  } finally {
    setIsLoading(false);
  }
};

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 bookingData={bookingData} handleChange={handleChange} onNext={() => setCurrentStep(2)} />;
      case 2:
        return <Step2 bookingData={bookingData} handleChange={handleChange} onPrev={() => setCurrentStep(1)} onNext={() => setCurrentStep(3)} />;
      case 3:
        return <Step3 bookingData={bookingData} handleChange={handleChange} onPrev={() => setCurrentStep(2)} onNext={() => setCurrentStep(4)} />;
      case 4:
        return <Step4 bookingData={bookingData} onPrev={() => setCurrentStep(3)} onSubmit={handleSubmitBooking} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <>
    <Navbar/>
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-en text-center mb-8">Reserve a Tee Time</h1>

      {/* โปรเกรสสำหรับหน้านี้ ให้มีแค่ 4 ขั้น */}
      <ul className="steps steps-vertical lg:steps-horizontal w-full mb-8">
        {["เลือกเวลาและคอร์ส", "ข้อมูลผู้เล่น", "บริการเสริม", "สรุปและยืนยัน"].map((label, i) => (
          <li key={i} className={`step ${currentStep > i ? "step step-neutral" : ""}`}>{label}</li>
        ))}
      </ul>

      <div className="min-h-96">{renderStep()}</div>
    </div>
    </>
  );
}
