import api from "./api";

const HOLE_API = "/hole";

// เพิ่มหลุมใหม่ (POST /hole/addhole)
const addHole = (payload) => api.post(`${HOLE_API}/addhole`, payload);

// ปิดหลุม (PUT /hole/close)
const closeHole = (payload) => api.put(`${HOLE_API}/close`, payload);

// เปิดหลุม (PUT /hole/open)
const openHole = (payload) => api.put(`${HOLE_API}/open`, payload);

// รายงานปัญหาหลุม (PUT /hole/report)
const reportHole = (payload) => api.put(`${HOLE_API}/report`, payload);

// ดึงข้อมูลหลุมทั้งหมด (GET /hole/gethole)
const getAllHoles = () => api.get(`${HOLE_API}/gethole`);

// ดึงข้อมูลหลุมตาม id (GET /hole/gethole/:id)
const getHoleById = (id) => api.get(`${HOLE_API}/gethole/${id}`);

// แจ้งขอความช่วยเหลือจากรถ (PUT /hole/help-car)
const reportHelpCar = (payload) => api.put(`${HOLE_API}/help-car`, payload);

// แจ้งว่ารถกอล์ฟมาถึงแล้ว (PUT /hole/go-car)
const resolveGoCar = (payload) => api.put(`${HOLE_API}/go-car`, payload);

const HoleService = {
  addHole,
  closeHole,
  openHole,
  reportHole,
  getAllHoles,
  getHoleById,
  reportHelpCar,
  resolveGoCar,
};

export default HoleService;