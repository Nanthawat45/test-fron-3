import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function StarterLayout() {
  const { user, logout } = useAuthContext();


  const navItem =
    "px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition";
  const navActive = ({ isActive }) =>
    `${navItem} ${isActive ? "bg-emerald-100 text-emerald-800" : "text-gray-700"}`;

    const handleLogout = async () => {
    try {
      await logout();               // ถ้า logout เป็น async
    } catch (e) {
      console.warn(e);
    } finally {
      window.location.replace("/"); // ไป "/" และ hard reload เคลียร์ state
      // ถ้าอยากใช้ react-router:
      // navigate("/", { replace: true });
      // window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/starter" className="flex items-center gap-3">
            <img src="/images/eden-Logo.png" alt="The Eden Golf Club Logo" className="h-10" />
            <span className="font-semibold text-gray-800">Starter</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/starter/dashboard" className={navActive}>
              Dashboard
            </NavLink>
            <NavLink to="/starter/report" className={navActive}>
              แจ้งปัญหา
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {user ? (
                <>
                  <span className="font-medium text-gray-800">{user.name || "Starter"}</span>{" "}
                  <span className="text-gray-400">({user.role})</span>
                </>
              ) : (
                <Link to="/login" className="text-emerald-700 hover:underline">
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>

            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                ออกจากระบบ
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t">
          <div className="px-4 py-2 flex gap-2">
            <NavLink to="/starter/dashboard" className={navActive}>
              Dashboard
            </NavLink>
            <NavLink to="/starter/report" className={navActive}>
              แจ้งปัญหา
            </NavLink>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
