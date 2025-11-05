import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom"; 
import Sidebar from "../../components/admin/Sidebar.jsx";
import Header from "../../components/admin/Header.jsx";
import UserService from "../../service/userService.js"; 

export default function AdminDashboard() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate(); 
    const location = useLocation(); 

    // Helper Function สำหรับ Normalize Role
    const normalizeRole = (role) => {
        if (!role) return 'N/A';
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    };

    // 💡 กำหนด activePage จาก Path ปัจจุบัน
    const getActivePageFromPath = () => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        const lastPart = pathParts.pop();
        
        if (pathParts[pathParts.length - 1] === 'admin') {
            if (!lastPart || lastPart === 'admin') return 'employeeData'; 
            if (lastPart === 'booking') return 'booking'; 
            if (lastPart === 'add') return 'addEmployee'; 
            if (lastPart === 'detail' || !isNaN(lastPart)) return 'employeeData'; 
        }
        return 'employeeData'; 
    };

    const activePage = getActivePageFromPath();

    // ✅ โหลดรายชื่อพนักงานและ Normalize Role ตั้งแต่แรก
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const res = await UserService.getAllNotUser(); 
                
                const normalizedEmployees = res.data.employees.map(emp => ({
                    ...emp,
                    // ⭐️ ใช้ Helper Function เพื่อ Normalize Role
                    role: normalizeRole(emp.role) 
                }));

                setEmployees(normalizedEmployees);
            } catch (error) {
                console.error("Fetch Employees Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    // ✅ อัปเดตข้อมูลพนักงาน (ใช้ในหน้า Edit Detail)
    const handleUpdateEmployee = async (id, formData) => {
        try {
            const res = await UserService.updateUser(id, formData);
            // ⭐️ ต้อง Normalize role ของข้อมูลที่อัปเดตก่อนนำไป Set State
            const updated = {
                ...res.data.user,
                role: normalizeRole(res.data.user.role)
            };

            setEmployees(prev =>
                prev.map(emp => (emp._id === id ? updated : emp))
            );
        } catch (error) {
            console.error("Update Employee Error:", error);
        }
    };

    // 🚀 การแก้ไขที่สำคัญ: รับ Object พนักงานใหม่มาอัปเดต State โดยตรง
    // เนื่องจาก EmployeeForm.jsx ยิง API แล้ว และส่ง Object ที่สำเร็จมาให้
    const handleAddEmployee = (newEmployeeObject) => {
        // ⭐️ Normalize role ของพนักงานใหม่ก่อนนำไป Set State
        const normalizedNewEmp = {
            ...newEmployeeObject,
            role: normalizeRole(newEmployeeObject.role)
        };
        
        setEmployees(prev => [normalizedNewEmp, ...prev]);
        console.log("พนักงานถูกเพิ่มใน State แล้ว:", normalizedNewEmp.name);
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar 
                activePage={activePage} 
                setActivePage={(page) => {
                    if (page === 'employeeData') navigate('/admin');
                    if (page === 'addEmployee') navigate('/admin/add');
                    if (page === 'booking') navigate('/admin/booking');
                }} 
            />
            
            <div className="flex-1 flex flex-col p-6 bg-gray-100">
                <Header activePage={activePage} />

                <div className="flex-1 overflow-auto mt-4">
                    <Outlet 
                        context={{ 
                            employees, // ส่งข้อมูลพนักงานที่ถูก normalize แล้ว
                            loading, 
                            handleUpdateEmployee, 
                            handleAddEmployee // ส่งฟังก์ชัน handler ที่แก้ไขแล้ว
                        }} 
                    />
                </div>
            </div>
        </div>
    );
}