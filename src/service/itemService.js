import api from "./api";

const ITEM_API = "/item";

// เพิ่มอุปกรณ์ใหม่ (POST /item/additem)
// ต้องล็อกอินก่อน เพราะ backend มี protect
const createItem = (payload) => api.post(`${ITEM_API}/additem`, payload);

// ดึงรายการรถกอล์ฟทั้งหมด (GET /item/getitemcar)
const getItemCar = () => api.get(`${ITEM_API}/getitemcar`);

// ดึงรายการถุงกอล์ฟทั้งหมด (GET /item/getitembag)
const getItemBag = () => api.get(`${ITEM_API}/getitembag`);

// ดึงรายการอุปกรณ์ทั้งหมดตามสถานะ (GET /item/all-status)
const getItemAllStatus = () => api.get(`${ITEM_API}/all-status`);

// ดึงข้อมูลอุปกรณ์ตาม id (GET /item/getbyiditem/:id)
const getItemById = (id) => api.get(`${ITEM_API}/getbyiditem/${id}`);

// ลบอุปกรณ์ (DELETE /item/:id)
// ต้องล็อกอินก่อน
const deleteItem = (id) => api.delete(`${ITEM_API}/${id}`);

const ItemService = {
  createItem,
  getItemCar,
  getItemBag,
  getItemAllStatus,
  getItemById,
  deleteItem,
};

export default ItemService;
