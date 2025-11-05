import { Link, useLocation } from "react-router-dom";

export default function UnauthorizedPage() {
  const { state } = useLocation();
  const reason = state?.reason || "forbidden";

  const text =
    reason === "auth"
      ? { title: "ยังไม่ได้เข้าสู่ระบบ", detail: "กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้" }
      : { title: "คุณไม่มีสิทธิ์เข้าหน้านี้", detail: "บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้" };

  return (
    <div className="min-h-screen grid place-items-center bg-linear-to-b from-white to-neutral-50 px-6">
      <section className="relative w-full max-w-md rounded-3xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-black/5">
        <div aria-hidden className="h-px rounded-t-3xl bg-linear-to-r from-transparent via-neutral-200 to-transparent" />
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-neutral-100">
            <span className="text-2xl">🔒</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {text.title}
          </h1>
          <p className="mt-2 text-neutral-600">{text.detail}</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="rounded-full px-4 py-2 text-sm font-medium bg-neutral-900 text-white hover:bg-black transition"
            >
              กลับหน้าแรก
            </Link>
            {reason === "auth" ? (
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                ไปหน้าเข้าสู่ระบบ
              </Link>
            ) : (
              <Link
                to="/profile"
                className="rounded-full px-4 py-2 text-sm font-medium bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition"
              >
                โปรไฟล์ของฉัน
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
