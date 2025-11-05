// src/pages/golfer/CheckoutSuccess.jsx
import { useEffect, useState } from "react";
import StripeService from "../../service/stripeService.js";

/** คืน 'YYYY-MM-DD' ภาษาไทย (แสดงผลเท่านั้น) */
function toThaiDate(d) {
  if (!d) return "-";
  try { return new Date(d).toLocaleDateString("th-TH"); } catch {}
}

/** ดึง body จาก axios หรืออ็อบเจ็กต์เดิม */
const body = (res) => res?.data ?? res;

/** แปลง caddy ให้เป็นชื่ออ่านง่าย (รองรับ id[] หรือ object[]) */
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
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // โหลด snapshot จาก Step4 เพื่อแสดงทันที (ให้ผู้ใช้เห็นข้อมูลไวๆ)
    const raw = sessionStorage.getItem("bookingPreview");
    if (raw) {
      try { setPreview(JSON.parse(raw)); } catch {}
    }

    const sid = StripeService.getSessionIdFromUrl(); // ?session_id=... หรือ ?sessionId=...
    if (!sid) {
      setState({ loading: false, data: null, error: "ไม่พบ session_id ใน URL" });
      return;
    }

    // ---- กัน race condition: webhook ช้ากว่า redirect ----
    // จะลองดึงซ้ำสูงสุด 6 ครั้ง ห่างกัน 2 วินาที (รวม ~10-12s)
    let cancelled = false;
    const MAX_RETRIES = 6;
    const DELAY_MS = 2000;

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    const fetchWithRetry = async () => {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const resp = await StripeService.getBookingBySession(sid); // GET /stripe/by-session/:sid (ต้องล็อกอิน)
          if (cancelled) return;
          setState({ loading: false, data: body(resp), error: "" });
          return; // ได้แล้ว ออกเลย
        } catch (e) {
          // case พบบ่อย:
          // 404 -> webhook ยังไม่สร้าง booking
          // 401 -> ยังไม่ล็อกอิน หรือ cookie/โดเมน CORS ไม่ตรง
          const status = e?.response?.status;
          const msg = e?.response?.data?.message || e.message || "ดึงผลการชำระเงินไม่สำเร็จ";

          if (status === 401) {
            setState({
              loading: false,
              data: null,
              error: "ยังไม่เข้าสู่ระบบ หรือเซสชันหมดอายุ กรุณาเข้าสู่ระบบแล้วกลับมาที่ลิงก์นี้อีกครั้ง",
            });
            return;
          }

          if (status === 404 && attempt < MAX_RETRIES) {
            await wait(DELAY_MS);
            continue;
          }

          setState({ loading: false, data: null, error: msg });
          return;
        }
      }
    };

    fetchWithRetry();

    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-neutral-50">
        <div className="rounded-2xl bg-white/70 backdrop-blur px-5 py-4 ring-1 ring-black/5 text-neutral-600">
          กำลังตรวจผลการชำระเงิน…
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-neutral-50">
        <div className="max-w-md w-full rounded-2xl bg-white/70 backdrop-blur p-6 ring-1 ring-red-200">
          <p className="text-red-600 text-center">{state.error}</p>

          {/* เผื่อ 401 ให้ไปล็อกอินก่อน */}
          <div className="text-center mt-4 flex items-center justify-center gap-2">
            <a href="/login" className="inline-block rounded-full px-4 py-2 bg-neutral-900 text-white hover:bg-black transition">
              เข้าสู่ระบบ
            </a>
            <a href="/" className="inline-block rounded-full px-4 py-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition">
              กลับหน้าหลัก
            </a>
          </div>
        </div>
      </div>
    );
  }

  // booking จริงจาก backend
  const booking = state.data?.booking || state.data || {};
  // แหล่งข้อมูลที่ใช้แสดง (prefer preview เพื่อเฟลชเร็ว)
  const show = preview ?? booking;

  // map id -> name หาก backend หรือ preview ส่งรายละเอียดมา
  const caddyMap = (() => {
    const arr =
      (preview?.caddyDetails && Array.isArray(preview.caddyDetails) && preview.caddyDetails) ||
      (booking?.caddyDetails && Array.isArray(booking.caddyDetails) && booking.caddyDetails) ||
      [];
    const map = {};
    for (const it of arr) {
      const id = it?._id || it?.id;
      const name = it?.name || it?.fullName;
      if (id && name) map[id] = name;
    }
    return map;
  })();

  const totalFromPreview = preview?.price?.total ?? show?.totalPrice;
  const mismatch =
    !!preview && Number(booking?.totalPrice ?? 0) !== Number(preview?.price?.total ?? 0);

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
          </div>

          {mismatch && (
            <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
              ⚠️ ระบบได้ปรับยอดชำระตามข้อมูลล่าสุด โปรดตรวจสอบรายละเอียดด้านล่าง
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
            <ul className="text-sm text-neutral-800 space-y-2">
              <li><span className="text-neutral-500">วันที่จอง:</span> {toThaiDate(show.date)}</li>
              <li><span className="text-neutral-500">เวลา:</span> {show.timeSlot || "-"}</li>
              <li><span className="text-neutral-500">จำนวนหลุม:</span> {show.courseType} หลุม</li>
              <li><span className="text-neutral-500">ชื่อกลุ่ม:</span> {show.groupName || "-"}</li>
              <li><span className="text-neutral-500">ผู้เล่น:</span> {show.players || 0} คน</li>
              <li>
                <span className="text-neutral-500">แคดดี้:</span>{" "}
                {renderCaddies(show.caddy, caddyMap)}
              </li>
              <li><span className="text-neutral-500">รถกอล์ฟ:</span> {show.golfCar || 0} คัน</li>
              <li><span className="text-neutral-500">ถุงกอล์ฟ:</span> {show.golfBag || 0} ใบ</li>
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

          <div className="mt-8 text-center flex items-center justify-center gap-2">
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
          </div>
        </section>
      </main>
    </div>
  );
}
