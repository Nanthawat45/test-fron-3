import api from "./api";

const BOOKING_API = "/booking";

// ฟังก์ชันนี้เรียก API: POST /booking/book
// ใช้สร้างการจองใหม่ พร้อมกับสร้าง Stripe Checkout
// ต้องล็อกอินก่อน (เพราะ backend ใช้ middleware protect)
const createBooking = (bookingData) => api.post(`${BOOKING_API}/book`, bookingData);

// ฟังก์ชันนี้เรียก API: GET /booking/getbook
// ใช้ดึงรายการการจองทั้งหมด (สำหรับแอดมินหรือสตาร์ทเตอร์)
const getAllBookings = () => api.get(`${BOOKING_API}/getbook`);

// ฟังก์ชันนี้เรียก API: GET /booking/getbyidbooked/:id
// ใช้ดึงรายละเอียดการจองเฉพาะรายการตาม ID
const getBookingById = (id) => api.get(`${BOOKING_API}/getbyidbooked/${id}`);

// ฟังก์ชันนี้เรียก API: GET /booking/getbyidbookinguser
// ใช้ดึงการจองทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
const getMyBookings = () => api.get(`${BOOKING_API}/getbyidbookinguser`);

// ฟังก์ชันนี้เรียก API: GET /booking/today
// ใช้ดึงการจองของวันปัจจุบัน หรือส่งวันที่ (YYYY-MM-DD) เพื่อดึงข้อมูลของวันนั้นได้
const getTodayBookings = (dateStr) =>
  api.get(`${BOOKING_API}/today`, {
    params: dateStr ? { date: dateStr } : undefined,
  });

// ฟังก์ชันนี้เรียก API: PUT /booking/updatebooking/:id
// ใช้อัปเดตข้อมูลของการจอง เช่น เปลี่ยนช่วงเวลา (timeSlot)
const updateBooking = (id, bookingData) =>
  api.put(`${BOOKING_API}/updatebooking/${id}`, bookingData);

// ฟังก์ชันนี้เรียก API: DELETE /booking/deletebooking/:id
// ใช้ลบการจองออกจากระบบ
const deleteBooking = (id) =>
  api.delete(`${BOOKING_API}/deletebooking/${id}`);

// ฟังก์ชันนี้เรียก API: POST /booking/available-timeslots
// ใช้ดึงเวลาที่ “ยังว่าง” ของวันนั้น ๆ (ใช้ตอนเลือกช่วงเวลาในการจอง)
// ส่ง date (YYYY-MM-DD) และ courseType ("9" หรือ "18") ได้
const getAvailableTimeSlots = ({ date, courseType } = {}) =>
  api.post(`${BOOKING_API}/available-timeslots`, {
    date: date || null,
    courseType: courseType || null,
  });

// รวมฟังก์ชันทั้งหมดไว้ใน object เพื่อให้ import ไปใช้งานได้สะดวก
const BookingService = {
  createBooking,
  getAllBookings,
  getBookingById,
  getMyBookings,
  getTodayBookings,
  updateBooking,
  deleteBooking,
  getAvailableTimeSlots,
};

export default BookingService;
