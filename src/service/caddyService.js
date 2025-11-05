import api from "./api";

const CADDY_API = "/caddy";

// เริ่มรอบ
const startRound = (bookingId) => api.put(`${CADDY_API}/start/${bookingId}`);

// จบรอบ
const endRound = (bookingId) => api.put(`${CADDY_API}/end/${bookingId}`);

// เปลี่ยนแคดดี้เป็น available
const markCaddyAsAvailable = (bookingId) =>
  api.put(`${CADDY_API}/available/${bookingId}`);

// ยกเลิกก่อนเริ่มรอบ
const cancelStart = (bookingId) =>
  api.put(`${CADDY_API}/cancel-start/${bookingId}`);

// ยกเลิกระหว่างรอบ
const cancelDuringRound = (bookingId) =>
  api.put(`${CADDY_API}/cancel-during-round/${bookingId}`);

// เปลี่ยนเป็น POST + ส่งวันที่ (optional)
const getAvailableCaddies = (dateStr) =>
  api.post(`${CADDY_API}/available-caddies`, {
    date: dateStr || null,
  });

// การจองของแคดดี้ที่ล็อกอินอยู่
const getCaddyBookings = () => api.get(`${CADDY_API}/caddybooking`);

const CaddyService = {
  startRound,
  endRound,
  markCaddyAsAvailable,
  cancelStart,
  cancelDuringRound,
  getAvailableCaddies,
  getCaddyBookings,
};

export default CaddyService;