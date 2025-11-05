// ฟังก์ชันคำนวณราคารวมสำหรับระบบจองกอล์ฟ

// กำหนดราคาพื้นฐานของสนามกอล์ฟ
const PRICE = {
  greenFee: {
    weekday: { "9": 1500, "18": 2200 },   // วันธรรมดา
    holiday: { "9": 2500, "18": 4000 },  // วันหยุด
  },
  caddyPerPlayer: 400,   // ค่าจ้างแคดดี้ต่อคน
  cartPerUnit: 500,      // ค่ารถกอล์ฟต่อคัน
  bagPerUnit: 300,       // ค่ากระเป๋าไม้กอล์ฟต่อใบ
};

// ตรวจสอบว่าวันที่เลือกเป็นวันหยุดหรือไม่ (เสาร์-อาทิตย์)
export function isHoliday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = อาทิตย์, 6 = เสาร์
  return day === 0 || day === 6;
}

// ฟังก์ชันคำนวณราคาทั้งหมด
export function calculatePriceBreakdown(booking = {}) {
  const {
    courseType = "18",      // จำนวนหลุม (9 หรือ 18)
    players = 1,            // จำนวนผู้เล่น
    caddy = [],             // รายชื่อแคดดี้ที่เลือก
    golfCartQty = 0,        // จำนวนรถกอล์ฟ
    golfBagQty = 0,         // จำนวนกระเป๋าไม้กอล์ฟ
    date = new Date(),      // วันที่จอง
  } = booking;

  // ตรวจสอบว่าเป็นวันหยุดหรือวันธรรมดา
  const holiday = isHoliday(date);
  const greenFeePerPlayer = holiday
    ? PRICE.greenFee.holiday[courseType]
    : PRICE.greenFee.weekday[courseType];

  // คำนวณราคาตามประเภท
  const greenFee = greenFeePerPlayer * players;
  const caddyFee = (Array.isArray(caddy) ? caddy.length : 0) * PRICE.caddyPerPlayer;
  const cartFee = golfCartQty * PRICE.cartPerUnit;
  const bagFee = golfBagQty * PRICE.bagPerUnit;

  // รวมทั้งหมด
  const total = greenFee + caddyFee + cartFee + bagFee;

  // คืนค่ารายละเอียดแต่ละส่วน พร้อมราคารวม
  return { greenFee, caddyFee, cartFee, bagFee, total };
}

// ฟังก์ชันคำนวณยอดรวมอย่างเดียว (แบบไม่แสดงรายละเอียด)
export function calculateTotalPrice(booking = {}) {
  return calculatePriceBreakdown(booking).total;
}




// แยกไฟล์ service ไว้ใช้เผื่อ backend จะแก้ไข // แยกเพื่อแก้ได้สะดวก
// ฟังชันคิดเงินไม่มีใน api ของ backend = จะไม่ปนฟังชันที่เพื่อนทำมา