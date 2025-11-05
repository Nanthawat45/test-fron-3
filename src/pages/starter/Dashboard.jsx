import React, { useEffect, useState } from "react";
import ItemService from "../../service/itemService"; // ✅ ใช้ service ที่มีอยู่

// สีป้ายสั้น ๆ
const colorClass = {
  success: "bg-green-500",
  info: "bg-sky-500",
  primary: "bg-indigo-500",
  purple: "bg-purple-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

// การ์ดสถานะแบบเบา ๆ (แทน StatusCard เดิม)
function StarterStatusCard({ image, count, label, color = "info" }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 border rounded-xl bg-white shadow-sm">
      {image ? (
        <img src={image} alt={label} className="w-20 h-20 object-cover rounded-lg" />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-gray-100" />
      )}
      <div className={`px-2 py-0.5 text-xs text-white rounded-full ${colorClass[color] || colorClass.info}`}>
        {label}
      </div>
      <div className="text-3xl font-bold text-gray-800">{count ?? 0}</div>
    </div>
  );
}

export default function Dashboard() {
  const [assetStatus, setAssetStatus] = useState({ golfCart: [], golfBag: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        // ✅ เรียกของจริงที่ backend มี: GET /api/item/all-status
        const res = await ItemService.getItemAllStatus();
        const data = res?.data ?? {};

        // ชื่อ key ตรงกับ controller: golfCar / golfBag
        const cart = data.golfCar || {};
        const bag = data.golfBag || {};

        const cartStatus = [
          { count: cart.available || 0, label: "รถกอล์ฟว่าง", color: "success" },
          { count: cart.inUse || 0,       label: "กำลังใช้งาน", color: "info" },
          { count: cart.booked || 0,      label: "จองแล้ว",     color: "primary" },
          { count: cart.clean || 0,       label: "เปลี่ยนแบต",  color: "purple" },
          { count: cart.spare || 0,       label: "รถสำรอง",     color: "warning" },
          { count: cart.broken || 0,      label: "รถเสีย",       color: "error" },
        ];

        const bagStatus = [
          { count: bag.available || 0, label: "กระเป๋าว่าง",   color: "success" },
          { count: bag.inUse || 0,     label: "กำลังใช้งาน",   color: "info" },
          { count: bag.booked || 0,    label: "จองแล้ว",       color: "primary" },
         // { count: bag.spare || 0,     label: "กระเป๋าสำรอง", color: "warning" },
          // { count: bag.broken || 0,    label: "กระเป๋าเสีย",   color: "error" },
        ];

        setAssetStatus({ golfCart: cartStatus, golfBag: bagStatus });
      } catch (err) {
        if (err?.response?.status === 401) {
          setError("คุณไม่ได้รับอนุญาตให้เข้าถึงข้อมูลนี้ กรุณาเข้าสู่ระบบอีกครั้ง");
        } else if (err?.response?.status === 404) {
          setError("ไม่พบ API /item/all-status ที่ฝั่งเซิร์ฟเวอร์");
        } else {
          setError("เกิดข้อผิดพลาดในการดึงข้อมูลสถานะ");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-center mt-10">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-6">
      <div className="flex justify-center mt-6">
        <div className="inline-block bg-black text-white text-2xl font-bold py-2 px-6 rounded max-w-max">
          สถานะ
        </div>
      </div>

      <div className="max-w-7xl mx-auto border rounded-xl shadow-md p-6 sm:p-8 mt-6">
        <div className="divider text-lg font-semibold text-gray-800">รถกอล์ฟ</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {assetStatus.golfCart.map((s, i) => (
<StarterStatusCard key={`cart-${i}`} image="/images/starter/cart.jpg" {...s} />
          ))}
        </div>

        <div className="divider text-lg font-semibold text-gray-800 mt-6">กระเป๋าไม้กอล์ฟ</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {assetStatus.golfBag.map((s, i) => (
<StarterStatusCard key={`bag-${i}`} image="/images/starter/bag.jpg" {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}
