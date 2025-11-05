// src/pages/golfer/CheckoutSuccess.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StripeService from "../../service/stripeService.js";

/** แปลงวันที่เป็นรูปแบบไทยเพื่อแสดงผล */
function toThaiDate(d) {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString("th-TH"); } catch {}
}

function renderCaddies(caddy, caddyMap) {
  if (!Array.isArray(caddy) || caddy.length === 0) return "0 คน";
  if (typeof caddy[0] === "object") {
    const names = caddy.map((c) => c.name || c.fullName || c._id || c.id).filter(Boolean);
    return `${caddy.length} คน (${names.join(", ")})`;
  }
  if (caddyMap) {
    const names = caddy.map((id) => caddyMap[id] || id);
    return `${caddy.length} คน (${names.join(", ")})`;
  }
  return `${caddy.length} คน (${caddy.join(", ")})`;
}

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = useMemo(
    () => params.get("session_id") || params.get("sessionId") || "",
    [params]
  );

  // โหลด snapshot ที่เราเก็บไว้ก่อนออกไป Stripe
  const [preview, setPreview] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bookingPreview");
      if (raw) setPreview(JSON.parse(raw));
    } catch {}
    // จ่ายเสร็จแล้ว เคลียร์ draft/step ออก
    sessionStorage.removeItem("bookingDraft");
    sessionStorage.removeItem("bookingCurrentStep");
  }, []);

  // map id -> name ถ้ามีรายละเอียดแคดดี้ติดมาด้วย
  const caddyMap = useMemo(() => {
    const arr =
      (preview?.caddyDetails && Array.isArray(preview.caddyDetails) && preview.caddyDetails) || [];
    const map = {};
    for (const it of arr) {
      const id = it?._id || it?.id;
      const name = it?.name || it?.fullName;
      if (id && name) map[id] = name;
    }
    return map;
  }, [preview]);

  const totalFromPreview = preview?.price?.total ?? preview?.totalPrice ?? 0;

  // (ออปชัน) ถ้าอยากซิงก์Bookingเข้าระบบทันที ค่อยกดปุ่มนี้เอง
  const handleManualSync = async () => {
    try {
      setSyncing(true);
      setSyncError("");
      // พึ่ง back ถ้าพร้อม (ถ้ายัง protect อยู่ ผู้ใช้ต้องล็อกอินก่อน)
      const resp = await StripeService.getBookingBySession(sessionId);
      // ถ้าอยากรวมข้อมูล backend มาโชว์ ก็ setPreview(resp.data.booking) ได้
      console.log("Synced booking:", resp?.data);
      alert("ซิงก์การจองสำเร็จ");
    } catch (e) {
      setSyncError(e?.response?.data?.message || e.message || "ซิงก์ไม่สำเร็จ");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-linear-to-b from-white to-neutral-50">
      <main className="max-w-lg mx-auto px-4 py-10">
        <section className="relative bg-white/80 backdrop-blur rounded-3xl shadow-sm ring-1 ring-black/5 p-6 md:p-8">
          <div aria-hidden className="absolute inset-0 rounded-3xl bg-linear-to-b from-white/70 via-white/40 to-white/10 pointer-events-none -z-10" />
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-100">
              <span className="text-emerald-700 text-xl">✓</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              ชำระเงินสำเร็จ
            </h2>
            <p className="text-neutral-600 mt-1">
              ขอบคุณที่ใช้บริการ Eden Golf Club การจองของคุณถูกบันทึกแล้ว
            </p>
            {!!sessionId && (
              <p className="text-xs text-neutral-400 mt-1">Session: {sessionId}</p>
            )}
          </div>

          {/* ถ้าไม่มี preview ก็ยังแสดงหน้าสำเร็จให้ก่อน */}
          {!preview && (
            <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
              ไม่พบข้อมูลตัวอย่างการจอง (preview) — คุณยังสามารถไปยังโปรไฟล์หรือเริ่มจองใหม่ได้
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
            <ul className="text-sm text-neutral-800 space-y-2">
              <li><span className="text-neutral-500">วันที่จอง:</span> {toThaiDate(preview?.date)}</li>
              <li><span className="text-neutral-500">เวลา:</span> {preview?.timeSlot || "-"}</li>
              <li><span className="text-neutral-500">จำนวนหลุม:</span> {preview?.courseType || "-"} หลุม</li>
              <li><span className="text-neutral-500">ชื่อกลุ่ม:</span> {preview?.groupName || "-"}</li>
              <li><span className="text-neutral-500">ผู้เล่น:</span> {preview?.players || 0} คน</li>
              <li>
                <span className="text-neutral-500">แคดดี้:</span>{" "}
                {renderCaddies(preview?.caddy || [], caddyMap)}
              </li>
              <li><span className="text-neutral-500">รถกอล์ฟ:</span> {preview?.golfCar || preview?.golfCartQty || 0} คัน</li>
              <li><span className="text-neutral-500">ถุงกอล์ฟ:</span> {preview?.golfBag || preview?.golfBagQty || 0} ใบ</li>
            </ul>

            <hr className="my-4" />

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">ยอดชำระทั้งหมด</span>
              <span className="text-xl font-semibold text-emerald-700">
                {Number(totalFromPreview || 0).toLocaleString()} บาท
              </span>
            </div>

            {preview?.price && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-neutral-700 hover:text-neutral-900">
                  ดูรายละเอียดค่าใช้จ่าย
                </summary>
                <ul className="mt-2 text-sm text-neutral-700 space-y-1">
                  <li>• Green Fee: {Number(preview.price.greenFee || 0).toLocaleString()} บาท</li>
                  <li>• Caddy: {Number(preview.price.caddyFee || 0).toLocaleString()} บาท</li>
                  <li>• Cart: {Number(preview.price.cartFee || 0).toLocaleString()} บาท</li>
                  <li>• Golf Bag: {Number(preview.price.bagFee || 0).toLocaleString()} บาท</li>
                </ul>
              </details>
            )}
          </div>

          {/* ปุ่มหลัก */}
          <div className="mt-8 text-center flex items-center justify-center gap-2 flex-wrap">
            <a
              href="/profile"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 bg-neutral-900 text-white hover:bg-black transition font-medium"
            >
              ไปยังโปรไฟล์ของฉัน
            </a>
            <a
              href="/booking"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition font-medium"
            >
              จองรอบต่อไป
            </a>

            {/* ปุ่มซิงก์ (ออปชัน) — ใช้เมื่อ backend พร้อม/ล็อกอินแล้ว */}
            {sessionId && (
              <button
                type="button"
                disabled={syncing}
                onClick={handleManualSync}
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition font-medium"
              >
                {syncing ? "กำลังซิงก์…" : "ซิงก์การจองเข้าระบบ"}
              </button>
            )}
          </div>

          {!!syncError && (
            <p className="text-center text-sm text-red-600 mt-3">{syncError}</p>
          )}
        </section>
      </main>
    </div>
  );
}
