import React, { useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import Label from "../../components/ui/label";
import UserService from "../../service/userService";

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { handleAddEmployee } = useOutletContext() || {};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    image: "/Images/Profile.jpg",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fileInputRef = useRef(null);

  const handleChange = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setFormData((p) => ({ ...p, image: newImageUrl }));
    }
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    const allowedRoles = ["admin", "caddy", "starter"];
    const roleLower = String(formData.role || "").toLowerCase();
    if (!allowedRoles.includes(roleLower)) {
      setError("ตำแหน่งงานไม่ถูกต้อง กรุณาเลือก Admin, Caddy หรือ Starter");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", roleLower);

      const file = fileInputRef.current?.files?.[0];
      if (file) data.append("image", file);

      const response = await UserService.adminRegisterUser(data);
      const createdUser = response?.data?.data || response?.data || response;

      if (createdUser && createdUser._id) {
        handleAddEmployee?.(createdUser);
        setSuccess("เพิ่มข้อมูลสำเร็จ ✅");
        setTimeout(() => navigate("/admin"), 1000);
      } else {
        setError(response?.data?.message || "เกิดข้อผิดพลาด: Server ไม่ได้ส่งข้อมูลผู้ใช้กลับมา");
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      setError(serverMessage ? `ข้อผิดพลาดจากเซิร์ฟเวอร์: ${serverMessage}` : `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.image?.startsWith("blob:")) URL.revokeObjectURL(formData.image);
    navigate("/admin");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-center items-start p-4 max-w-4xl mx-auto">
      <div className="flex justify-center md:justify-start">
        <div className="bg-white p-2 rounded shadow-md w-48 h-fit text-center">
          <img src={formData.image} alt="Profile" className="rounded-full w-40 h-40 mx-auto object-cover" />
          <Input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          <Button className="w-full mt-4 bg-green-600 text-white hover:bg-green-800" onClick={handleButtonClick} type="button">
            อัปโหลดรูปภาพ
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 bg-white p-6 rounded shadow-md space-y-4 w-full max-w-md">
        {error && <div className="text-red-500 text-center">{error}</div>}
        {success && <div className="text-green-500 text-center">{success}</div>}

        <div>
          <Label>ชื่อ - นามสกุล</Label>
          <Input placeholder="กรุณากรอกชื่อ - นามสกุล" required value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
        </div>

        <div>
          <Label>อีเมล</Label>
          <Input type="email" placeholder="กรุณากรอกอีเมล" required value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
        </div>

        <div>
          <Label>เบอร์โทรศัพท์</Label>
          <Input type="text" placeholder="กรุณากรอกเบอร์โทรศัพท์" required value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
        </div>

        <div>
          <Label>รหัสผ่าน</Label>
          <Input type="password" placeholder="กรุณากรอกรหัสผ่าน" required value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
        </div>

        <div>
          <Label>ยืนยันรหัสผ่าน</Label>
          <Input type="password" placeholder="กรุณายืนยันรหัสผ่าน" required value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} />
        </div>

        <div>
          <Label>กรุณาเลือกตำแหน่งงาน</Label>
          <select
            required
            value={formData.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className="border border-black rounded p-2 w-full"
          >
            <option value="">เลือกตำแหน่ง</option>
            <option value="admin">Admin</option>
            <option value="caddy">Caddy</option>
            <option value="starter">Starter</option>
          </select>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button type="submit" className="flex-1 bg-green-600 text-white hover:bg-green-800" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
          <Button type="button" className="flex-1 bg-red-500 text-white hover:bg-red-800" onClick={handleCancel}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
}
