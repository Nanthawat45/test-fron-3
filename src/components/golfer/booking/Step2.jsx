import React from "react";

const Step2 = ({ bookingData, handleChange, onNext, onPrev }) => {
  const { players, groupName } = bookingData;
  const isNextDisabled = players < 1 || players > 4 || !groupName.trim();

  return (
    <div
      className="
        max-w-md mx-auto p-6
        rounded-3xl
        bg-white/60 backdrop-blur-lg
        border border-neutral-200/40 ring-1 ring-white/30 shadow-md
      "
    >
      <h2 className="text-[22px] font-th text-neutral-900 text-center tracking-tight mb-6">
        Step 2: จำนวนผู้เล่นและชื่อกลุ่ม
      </h2>

      {/* Players */}
      <div className="mb-6 text-center">
        <label className="block text-neutral-700 text-sm font-th mb-2">
          จำนวนผู้เล่น (สูงสุด 4 คน)
        </label>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              handleChange({
                target: { name: "players", value: Math.max(1, players - 1) },
              })
            }
            disabled={players <= 1}
            className="
              px-4 py-2 rounded-full text-lg
              bg-neutral-100 text-neutral-900
              hover:bg-neutral-200
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            –
          </button>

          <span className="text-2xl font-th text-neutral-900 tabular-nums">{players}</span>

          <button
            type="button"
            onClick={() =>
              handleChange({
                target: { name: "players", value: players + 1 },
              })
            }
            disabled={players >= 4}
            className="
              px-4 py-2 rounded-full text-lg
              bg-neutral-100 text-neutral-900
              hover:bg-neutral-200
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            +
          </button>
        </div>
      </div>

      {/* Group name */}
      <div className="mb-6">
        <label className="block text-neutral-700 text-sm font-th mb-2">
          ชื่อกลุ่ม
        </label>
        <input
          type="text"
          name="groupName"
          value={groupName}
          onChange={handleChange}
          placeholder="กรุณาระบุชื่อกลุ่ม"
          required
          className="
            w-full px-4 py-2 rounded-2xl
            bg-white/80
            border border-neutral-200
            text-neutral-800
            shadow-sm outline-none
            focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600
            transition
          "
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onPrev}
          type="button"
          className="
            px-6 py-2 rounded-full font-th
            bg-neutral-900 text-white hover:bg-black
            transition-colors
          "
        >
          ย้อนกลับ
        </button>

        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={[
            "px-6 py-2 rounded-full font-th transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isNextDisabled
              ? "bg-neutral-300 text-neutral-500"
              : "bg-emerald-600 text-white hover:bg-emerald-700",
          ].join(" ")}
        >
          จองต่อ
        </button>
      </div>
    </div>
  );
};

export default Step2;
