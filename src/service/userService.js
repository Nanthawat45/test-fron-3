import api from "./api";

const USER_API = "/user";

// ดึงผู้ใช้ทั้งหมด (GET /user/all)
const getAllUsers = () => api.get(`${USER_API}/all`);

// ดึงรายชื่อพนักงาน (ที่ไม่ใช่ user ทั่วไป) (GET /user/allnotuser)
const getAllNotUser = () => api.get(`${USER_API}/allnotuser`);

// ดึงโปรไฟล์ของตัวเอง (GET /user/profile)
const getUserProfile = () => api.get(`${USER_API}/profile`);

// ดึงผู้ใช้ตาม id (GET /user/getbyiduser/:id)
const getUserById = (id) => api.get(`${USER_API}/getbyiduser/${id}`);

// สมัครสมาชิก (สาธารณะ) (POST /user/register)
const registerUser = (payload) => api.post(`${USER_API}/register`, payload);

// สมัครโดยแอดมิน (อัปโหลดไฟล์) (POST /user/admin/register)
const adminRegisterUser = (formData) =>
  api.post(`${USER_API}/admin/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// อัปเดตข้อมูลผู้ใช้ (อัปโหลดไฟล์) (PUT /user/updateuser/:id)
const updateUser = (id, formData) =>
  api.put(`${USER_API}/updateuser/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// เข้าสู่ระบบ (POST /user/login)
const loginUser = (credentials) => api.post(`${USER_API}/login`, credentials);

// ออกจากระบบ (POST /user/logout)
const logoutUser = () => api.post(`${USER_API}/logout`);

const UserService = {
  getAllUsers,
  getAllNotUser,
  getUserProfile,
  getUserById,
  registerUser,
  adminRegisterUser,
  updateUser,
  loginUser,
  logoutUser,
};

export default UserService;
