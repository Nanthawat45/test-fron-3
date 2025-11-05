import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    withCredentials: true, // ส่ง HttpOnly Cookie (cookie-based JWT auth)
    // เปิดให้ browser ส่ง cookie (ที่มี token แบบ httpOnly) ไปกับทุก request โดยอัตโนมัติ
    headers: {
        'Content-Type': 'application/json',
    },
});

// error ข้อความผิดพลาดของเว็บ
function thaiErrMessage(error) {
  const status = error?.response?.status;
  const msg = error?.response?.data?.message || error?.message || "";

  if (status === 401) return "ยังไม่เข้าสู่ระบบ หรือเซสชันหมดอายุ";
  if (status === 403) return "ไม่มีสิทธิ์ทำรายการนี้";
  if (status === 404) return "ไม่พบข้อมูลหรือปลายทางที่เรียกใช้";
  if (status === 409) return "รายการนี้ถูกจองแล้ว หรือเวลานี้ไม่ว่าง";
  if (status === 422) return "ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  if (status >= 500) return "เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ภายหลัง";
  if (/Network Error/i.test(msg)) return "เชื่อมต่อเครือข่ายไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
  return msg || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    error.thaiMessage = thaiErrMessage(error);
    return Promise.reject(error);
  }
);

export default api;

// ระบบนี้ใช้ JWT แบบเก็บใน cookie (httpOnly)
// ไม่ต้องแนบ token เองใน header เช่น Authorization หรือ x-access-token
// เพราะ browser จะส่ง cookie ให้อัตโนมัติเมื่อมี withCredentials: true
