// src/pages/Caddy/CaddyProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../service/userService";

const CaddyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    _id: "",
    name: "",
    phone: "",
    email: "",
    role: "",
    img: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await UserService.getUserProfile(); // ✅ ถูกเส้น /api/user/profile
        // คาดว่า data เป็นอ็อบเจกต์เดียวตามรูป Postman
        setProfile({
          _id: data?._id ?? "",
          name: data?.name ?? "",
          phone: data?.phone ?? "",
          email: data?.email ?? "",
          role: data?.role ?? "",
          img: data?.img ?? null,
        });
      } catch (e) {
        setError(
          e?.response?.data?.message ||
            "ไม่สามารถดึงข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-700 hover:text-gray-900"
        >
          &lt; ย้อนกลับ
        </button>
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 hover:text-gray-900 font-semibold"
        >
          &lt; ย้อนกลับ
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-indigo-500 ring-offset-2 bg-gray-100">
            {profile.img ? (
              <img
                src={profile.img}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                ไม่มีรูป
              </div>
            )}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            {profile.name || "-"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">ID: {profile._id || "-"}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-gray-700">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-sm text-gray-600">อีเมล</div>
            <div className="font-semibold text-gray-900">
              {profile.email || "-"}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-sm text-gray-600">เบอร์โทรศัพท์</div>
            <div className="font-semibold text-gray-900">
              {profile.phone || "-"}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-sm text-gray-600">บทบาท (role)</div>
            <div className="font-semibold text-gray-900">
              {profile.role || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaddyProfile;
