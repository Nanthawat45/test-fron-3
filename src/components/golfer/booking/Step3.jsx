import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import LoadingAnimation from "../../golfer/animations/LoadingAnimation";
import CaddyService from "../../../service/caddyService";

/* ---------- helpers ---------- */
const HOLD_KEY = (d, t, ct) => `caddy-holds:${d || "none"}:${t || "none"}:${ct || "none"}`;

const idOf = (c = {}) => String(c.caddy_id || c._id || c.id || "");
const sameSlot = (a = {}, b = {}) => {
  const ad = a.date || a.d;
  const at = a.timeSlot || a.t;
  const ac = String(a.courseType ?? a.ct ?? "");
  const bd = b.date || b.d;
  const bt = b.timeSlot || b.t;
  const bc = String(b.courseType ?? b.ct ?? "");
  return String(ad) === String(bd) && String(at) === String(bt) && String(ac) === String(bc);
};
const readHolds = (d, t, ct) => {
  try {
    const v = JSON.parse(sessionStorage.getItem(HOLD_KEY(d, t, ct)) || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};
const writeHolds = (d, t, ct, ids = []) => {
  const set = Array.from(new Set(ids.map(String)));
  sessionStorage.setItem(HOLD_KEY(d, t, ct), JSON.stringify(set));
};

export default function Step3({ bookingData, handleChange, onNext, onPrev }) {
  const {
    golfCartQty = 0,
    golfBagQty = 0,
    caddy = [],
    caddySelectionEnabled = false,
    players = 1,
    date = "",
    timeSlot = "",
    courseType = "",
  } = bookingData;

  const [caddySearchTerm, setCaddySearchTerm] = useState("");
  const [availableCaddies, setAvailableCaddies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  const requiredCaddies = Number(players || 0);
  const selectedCount = Array.isArray(caddy) ? caddy.length : 0;

  /** โหลดรายชื่อแคดดี้ */
  const loadCaddies = useCallback(
    async (signal) => {
      if (!date) return;
      try {
        setIsLoading(true);
        setError("");

        const resp = await CaddyService.getAvailableCaddies(date);
        const raw = resp?.data ?? resp ?? [];
        const list = Array.isArray(raw) ? raw : raw.list || raw.items || raw.data || [];

        const normalized = (list || [])
          .filter(Boolean)
          .filter((c) => (c.caddyStatus || c.status || "available").toLowerCase() === "available")
          .filter((c) => {
            const busy = c.busySlots || c.unavailable || c.bookings || c.slots || [];
            if (!Array.isArray(busy) || busy.length === 0) return true;
            return !busy.some((s) => sameSlot(s, { date, timeSlot, courseType }));
          })
          .map((c) => ({
            id: idOf(c),
            name: c.name || c.fullName || `Caddy ${c.code || ""}`.trim(),
            profilePic: c.profilePic || c.avatar || "",
          }));

        if (!signal?.aborted) setAvailableCaddies(normalized);
      } catch (e) {
        if (!signal?.aborted) {
          setError(e?.response?.data?.message || e.message || "โหลดรายชื่อแคดดี้ไม่สำเร็จ");
          setAvailableCaddies([]);
        }
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [date, timeSlot, courseType]
  );

  /** โหลดอัตโนมัติเมื่อเปิดสวิตช์/เปลี่ยน slot */
  useEffect(() => {
    if (!caddySelectionEnabled || !date) {
      setAvailableCaddies([]);
      setError("");
      return;
    }
    const ac = new AbortController();
    loadCaddies(ac.signal);

    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadCaddies(ac.signal), 15000);

    const onFocus = () => document.visibilityState === "visible" && loadCaddies(ac.signal);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      ac.abort();
      clearInterval(pollRef.current);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [caddySelectionEnabled, date, loadCaddies]);

  /** soft holds (ต่อ slot ปัจจุบัน) */
  const softHolds = useMemo(
    () => readHolds(date, timeSlot, courseType),
    [date, timeSlot, courseType]
  );

  /** filter: ตัดคนที่ถูก hold + คำค้น */
  const filteredCaddies = useMemo(() => {
    const kw = caddySearchTerm.trim().toLowerCase();
    return availableCaddies
      .filter((c) => !softHolds.includes(String(c.id)))
      .filter((c) => (c.name || "").toLowerCase().includes(kw));
  }, [availableCaddies, softHolds, caddySearchTerm]);

  /** เลือก/ยกเลิกแคดดี้ */
  const handleCaddySelection = (caddyIdRaw) => {
    const caddyId = String(caddyIdRaw);
    let selected = caddy.map(String);

    if (selected.includes(caddyId)) {
      selected = selected.filter((id) => id !== caddyId);
      writeHolds(
        date,
        timeSlot,
        courseType,
        readHolds(date, timeSlot, courseType).filter((id) => id !== caddyId)
      );
    } else {
      if (selected.length >= requiredCaddies) {
        setError(`ต้องเลือกแคดดี้ให้ครบจำนวนผู้เล่น (${requiredCaddies} คน)`);
        return;
      }
      selected = [...selected, caddyId];
      writeHolds(date, timeSlot, courseType, [...readHolds(date, timeSlot, courseType), caddyId]);
    }

    const nextCount = selected.length;
    if (nextCount < requiredCaddies) {
      setError(`ต้องเลือกแคดดี้ให้ครบ ${requiredCaddies} คน (เลือกแล้ว ${nextCount})`);
    } else {
      setError("");
    }

    handleChange({ target: { name: "caddy", value: selected } });
  };

  /** เปลี่ยน slot → ล้าง holds */
  useEffect(() => {
    return () => writeHolds(date, timeSlot, courseType, []);
  }, [date, timeSlot, courseType]);

  /** ปุ่มต่อ */
  const needCaddies = !!caddySelectionEnabled;
  const canProceed = !needCaddies || selectedCount === requiredCaddies;
  const nextDisabled = !canProceed;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white/60 backdrop-blur-lg rounded-3xl border border-neutral-200/40 ring-1 ring-white/30 shadow-md">
      <h2 className="text-[22px] font-th text-neutral-900 text-center mb-6">Step 3: บริการเสริม</h2>

      {/* Golf Bag */}
      <div className="mb-6 text-center">
        <label className="block text-neutral-700 text-sm font-th mb-2">จำนวนกระเป๋าไม้กอล์ฟ</label>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChange({
                target: { name: "golfBagQty", value: Math.max(0, Number(golfBagQty) - 1) },
              });
            }}
            className="px-4 py-2 rounded-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition"
          >
            –
          </button>
          <span className="text-2xl font-th text-neutral-900 tabular-nums">{golfBagQty}</span>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChange({
                target: { name: "golfBagQty", value: Number(golfBagQty) + 1 },
              });
            }}
            className="px-4 py-2 rounded-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition"
          >
            +
          </button>
        </div>
        <p className="text-xs text-neutral-500 mt-1">*ค่าบริการกระเป๋าไม้กอล์ฟ/ท่าน 300 บาท</p>
      </div>

      {/* Golf Cart */}
      <div className="mb-6 text-center">
        <label className="block text-neutral-700 text-sm font-th mb-2">จำนวนรถกอล์ฟ</label>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChange({
                target: { name: "golfCartQty", value: Math.max(0, Number(golfCartQty) - 1) },
              });
            }}
            className="px-4 py-2 rounded-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition"
          >
            –
          </button>
          <span className="text-2xl font-th text-neutral-900 tabular-nums">{golfCartQty}</span>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChange({
                target: { name: "golfCartQty", value: Number(golfCartQty) + 1 },
              });
            }}
            className="px-4 py-2 rounded-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition"
          >
            +
          </button>
        </div>
        <p className="text-xs text-neutral-500 mt-1">*ค่าบริการรถกอล์ฟ/คัน 500 บาท</p>
      </div>

      {/* Caddy */}
      <div className="mb-6 border-t border-neutral-200 pt-6">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="caddy-selection-toggle"
            checked={!!caddySelectionEnabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => e.preventDefault()}
            onChange={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (caddySelectionEnabled) {
                handleChange({ target: { name: "caddy", value: [] } });
                writeHolds(date, timeSlot, courseType, []);
                handleChange({ target: { name: "caddySelectionEnabled", value: false } });
                setError("");
              } else {
                handleChange({ target: { name: "caddySelectionEnabled", value: true } });
                setError(
                  requiredCaddies > 0
                    ? `ต้องเลือกแคดดี้ให้ครบ ${requiredCaddies} คน (เลือกแล้ว 0)`
                    : ""
                );
                await loadCaddies();
              }
            }}
            className="mr-2 h-4 w-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="caddy-selection-toggle" className="text-neutral-800 font-th text-sm">
            ต้องการเลือกแคดดี้
          </label>
        </div>

        {caddySelectionEnabled && (
          <div className="space-y-4">
            <div
              className={[
                "text-sm rounded-xl px-3 py-2 border",
                selectedCount === requiredCaddies
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-700",
              ].join(" ")}
            >
              ต้องเลือกแคดดี้ให้ครบ <b>{requiredCaddies}</b> คน (เลือกแล้ว <b>{selectedCount}</b>)
            </div>

            <input
              type="text"
              placeholder="ค้นหาชื่อแคดดี้..."
              value={caddySearchTerm}
              onChange={(e) => setCaddySearchTerm(e.target.value)}
              onMouseDown={(e) => e.preventDefault()}
              className="w-full px-3 py-2 rounded-2xl bg-white/80 border border-neutral-200 text-neutral-800 shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />

            {isLoading ? (
              <div className="flex justify-center py-3">
                <LoadingAnimation />
              </div>
            ) : error && !error.startsWith("ต้องเลือกแคดดี้") ? (
              <p className="text-center text-red-500 text-sm">{error}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              {filteredCaddies.length > 0 ? (
                filteredCaddies.map((c) => {
                  const cid = String(c.id);
                  const picked = caddy.map(String).includes(cid);
                  const limitReached = !picked && selectedCount >= requiredCaddies;
                  return (
                    <div
                      key={cid}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!limitReached) handleCaddySelection(cid);
                      }}
                      className={[
                        "flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all",
                        picked
                          ? "bg-emerald-50 border border-emerald-300 scale-[1.02]"
                          : limitReached
                          ? "bg-neutral-100 border border-neutral-200 opacity-60 cursor-not-allowed"
                          : "bg-white/70 border border-neutral-200 hover:bg-neutral-50 hover:scale-[1.01]",
                      ].join(" ")}
                      title={limitReached ? "เลือกได้เท่าจำนวนผู้เล่นเท่านั้น" : ""}
                    >
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2">
                        <img
                          src={
                            c.profilePic ||
                            "https://placehold.co/96x96/cccccc/ffffff?text=Caddy"
                          }
                          alt={c.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/96x96/cccccc/ffffff?text=Caddy";
                          }}
                        />
                        {picked && (
                          <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            ✓ เลือกแล้ว
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-neutral-800">{c.name}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">ว่าง</p>
                    </div>
                  );
                })
              ) : (
                <p className="col-span-2 text-center text-neutral-500 text-sm">
                  ไม่พบแคดดี้ที่ค้นหา
                </p>
              )}
            </div>
          </div>
        )}
        <p className="text-xs text-neutral-500 mt-3">*ค่าบริการแคดดี้/ท่าน 400 บาท</p>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPrev();
          }}
          type="button"
          className="px-6 py-2 rounded-full font-th bg-neutral-900 text-white hover:bg-black transition-colors"
        >
          ย้อนกลับ
        </button>

        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!canProceed) {
              setError(`ต้องเลือกแคดดี้ให้ครบ ${requiredCaddies} คน (เลือกแล้ว ${selectedCount})`);
              return;
            }
            onNext();
          }}
          disabled={nextDisabled}
          className={[
            "px-6 py-2 rounded-full font-th transition-colors",
            nextDisabled
              ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700",
          ].join(" ")}
        >
          ยืนยันการจอง
        </button>
      </div>
    </div>
  );
}
