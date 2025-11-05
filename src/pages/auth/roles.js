// รายชื่อ role ที่ถือเป็นพนักงาน/ผู้ดูแล
export const STAFF_ROLES = ["admin", "starter", "caddy"];

// true ถ้าเป็นพนักงาน/ผู้ดูแล
export const isStaffRole = (role) =>
  STAFF_ROLES.includes(String(role || "").toLowerCase());