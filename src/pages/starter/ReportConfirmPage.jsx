import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const COLOR_MAP = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
};
const ALLOWED_COLORS = Object.keys(COLOR_MAP);

/**
 * ใช้ได้สองแบบ:
 * 1) navigate("/starter/report/confirm", { state: { title, hole, color, isError } })
 * 2) /starter/report/confirm?title=...&hole=...&color=...&isError=true
 */
export default function ReportConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = useMemo(() => {
    const state = (location.state ?? {});
    const sp = new URLSearchParams(location.search);

    const title = state.title ?? sp.get("title") ?? "";
    const hole = state.hole ?? sp.get("hole") ?? "";
    const colorRaw = String(state.color ?? sp.get("color") ?? "").toLowerCase();
    const isError =
      typeof state.isError === "boolean"
        ? state.isError
        : sp.get("isError") === "true";

    const color = ALLOWED_COLORS.includes(colorRaw) ? colorRaw : "green";
    return { title, hole, color, isError };
  }, [location.state, location.search]);

  useEffect(() => {
    if (!data.title && !data.hole) {
      navigate("/starter/report", { replace: true });
    }
  }, [data.title, data.hole, navigate]);

  const circleColor = COLOR_MAP[data.color] || "bg-gray-400";
  const titleText = data.title ? `${data.title} สำเร็จ` : "สำเร็จ!";
  const holeText = data.hole ? `หลุมที่ ${data.hole}` : "";

  const handleClose = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/starter/report", { replace: true });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-[90%] max-w-sm text-center space-y-6">
        <div
          className={`${data.isError ? "bg-red-500" : circleColor} w-12 h-12 rounded-full mx-auto`}
          aria-hidden
        />
        <h3 className="text-lg font-semibold">
          {data.isError ? (data.title || "เกิดข้อผิดพลาด!") : titleText}
        </h3>
        {holeText && <p>{holeText}</p>}

        <button
          onClick={handleClose}
          className={`${
            data.isError ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-green-600"
          } text-white px-6 py-2 rounded-full transition-colors duration-300`}
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
