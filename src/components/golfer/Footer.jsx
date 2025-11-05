export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} The Eden Golf Club. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm">
          <a href="/terms" className="text-slate-500 hover:text-slate-900">ข้อตกลงการใช้บริการ</a>
          <a href="/privacy" className="text-slate-500 hover:text-slate-900">นโยบายความเป็นส่วนตัว</a>
          <a href="/contact" className="text-slate-500 hover:text-slate-900">ติดต่อเรา</a>
        </div>
      </div>
    </footer>
  );
}