import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import Step1 from "../../components/golfer/booking/Step1";
import Step2 from "../../components/golfer/booking/Step2";
import Step3 from "../../components/golfer/booking/Step3";
import Step4 from "../../components/golfer/booking/Step4";

import { calculateTotalPrice } from "../../service/calculatePrice";
import StripeService from "../../service/stripeService";
import Navbar from "../../components/golfer/Navbar";

const formatDate = (dateLike) => {
  // รับได้ทั้ง Date หรือ string แล้วบังคับให้ออกเป็น YYYY-MM-DD เสมอ
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function GolferBookingPage() {
  const [params] = useSearchParams();
  const cancelled = params.get("cancelled") === "1";

  const [currentStep, setCurrentStep] = useState(1);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // ---------- คืนค่า draft เมื่อยกเลิกชำระเงิน ----------
  useEffect(() => {
    if (!cancelled) return;
    const raw = sessionStorage.getItem("bookingDraft");
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        // บังคับ format date อีกครั้งกันเพี้ยน
        draft.date = formatDate(draft.date);
        setBookingData(draft);
        setNotice("คุณยกเลิกการชำระเงิน ข้อมูลเดิมถูกกู้คืนให้แล้ว");
      } catch {
        setNotice("คุณยกเลิกการชำระเงิน");
      }
    } else {
      setNotice("คุณยกเลิกการชำระเงิน");
    }
  }, [cancelled]);

  // ---------- อัปเดตราคารวมอัตโนมัติ ----------
  useEffect(() => {
    const total = calculateTotalPrice(bookingData);
    if (bookingData.totalPrice !== total) {
      setBookingData((prev) => ({ ...prev, totalPrice: total }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bookingData.courseType,
    bookingData.timeSlot,
    bookingData.players,
    bookingData.caddy,
    bookingData.golfCartQty,
    bookingData.golfBagQty,
  ]);

  // ---------- ออโต้เซฟร่างทุกครั้งที่ผู้ใช้แก้ไข ----------
  useEffect(() => {
    try {
      const snapshot = { ...bookingData, date: formatDate(bookingData.date) };
      sessionStorage.setItem("bookingDraft", JSON.stringify(snapshot));
    } catch {
      /* ignore */
    }
  }, [bookingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // ฟิลด์ตัวเลข
    if (["players", "golfCartQty", "golfBagQty"].includes(name)) {
      setBookingData((prev) => ({ ...prev, [name]: parseInt(value || 0) }));
      return;
    }
    // วันที่
    if (name === "date") {
      setBookingData((prev) => ({ ...prev, date: formatDate(value) }));
      return;
    }
    // ทั่วไป
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- กดชำระเงิน → สร้าง session → ไป Stripe ----------
  const handleSubmitBooking = async () => {
    try {
      setIsLoading(true);
      setNotice("");

      const payload = {
        ...bookingData,
        date: formatDate(bookingData.date),
        totalPrice: calculateTotalPrice(bookingData),
      };

      // เก็บร่าง/พรีวิวก่อนออกไป Stripe (เผื่อยกเลิกจะกู้คืน)
      sessionStorage.setItem("bookingDraft", JSON.stringify(payload));
      sessionStorage.setItem(
        "bookingPreview",
        JSON.stringify({
          ...payload,
          price: { total: payload.totalPrice },
        })
      );

      const resp = await StripeService.createCheckout(payload);
      const data = resp?.data ?? resp;
      const paymentUrl = data?.paymentUrl || data?.url;
      if (!paymentUrl) {
        throw new Error(data?.message || "ไม่พบลิงก์ชำระเงินจากเซิร์ฟเวอร์");
      }

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
        return (
          <Step1
            bookingData={bookingData}
            handleChange={handleChange}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <Step2
            bookingData={bookingData}
            handleChange={handleChange}
            onPrev={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <Step3
            bookingData={bookingData}
            handleChange={handleChange}
            onPrev={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        );
      case 4:
        return (
          <Step4
            bookingData={bookingData}
            onPrev={() => setCurrentStep(3)}
            onSubmit={handleSubmitBooking}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-en text-center mb-8">Reserve a Tee Time</h1>

        {!!notice && (
          <div className="mb-6 rounded-lg bg-yellow-50 text-yellow-800 px-4 py-2">
            {notice}
          </div>
        )}

        <ul className="steps steps-vertical lg:steps-horizontal w-full mb-8">
          {["เลือกเวลาและคอร์ส", "ข้อมูลผู้เล่น", "บริการเสริม", "สรุปและยืนยัน"].map((label, i) => (
            <li key={i} className={`step ${currentStep > i ? "step step-neutral" : ""}`}>
              {label}
            </li>
          ))}
        </ul>

        <div className="min-h-96">{renderStep()}</div>
      </div>
    </>
  );
}
