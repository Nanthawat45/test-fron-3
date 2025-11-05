// EmployeePage.jsx
import React, { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
// 💡 เปลี่ยนชื่อเป็น EmployeeCard เพื่อสื่อถึง Component ที่แสดงผล (ต้องมี Component นี้อยู่จริง)
import EmployeeCard from "./EmployeeCard"; 

// 💡 กำหนด Roles หลักที่คุณต้องการแสดง
const roles = ["All", "Admin", "Caddy", "Starter"]; 

export default function EmployeePage() {
    // ⭐️ ดึงข้อมูลหลักและ handlers จาก AdminDashboard (Outlet Context)
    // ข้อมูล employees ที่ได้มา ได้ถูก normalize role แล้ว
    const { employees, loading } = useOutletContext(); 
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All"); 
    
    // 💡 สร้าง List ของ Roles และนับจำนวน (ใช้ useMemo เพื่อประสิทธิภาพ)
    const roleCounts = useMemo(() => {
        // ให้เริ่มต้น All ด้วย employees.length ที่โหลดมาทั้งหมด
        const counts = { All: employees.length }; 
        
        employees.forEach(emp => {
            // emp.role ได้ถูก normalize เป็น 'Admin', 'Caddy' ฯลฯ แล้วจาก AdminDashboard
            // ใช้ค่าที่ normalize แล้วในการนับ
            const role = emp.role || 'N/A'; 
            
            // นับเฉพาะ Role ที่กำหนดใน List (รวมถึงการนับ Role ใหม่ๆ ที่อาจถูกเพิ่มเข้ามาในอนาคต)
            if (roles.includes(role)) { 
                counts[role] = (counts[role] || 0) + 1;
            } else if (role !== 'N/A') {
                // หากมี Role อื่นที่ไม่ใช่ 'Admin', 'Caddy', 'Starter' ก็จะถูกรวมใน 'All' เท่านั้น
                // คุณอาจเพิ่ม logic เพื่อจัดการ Role ที่ไม่ได้กำหนดไว้ใน List 'roles' นี้ได้
            }
        });
        
        // **ปรับปรุงการนับ**: ตรวจสอบให้แน่ใจว่า Role ที่กำหนดใน 'roles' มีค่าเป็น 0 ถ้าไม่มีพนักงานใน Role นั้นๆ
        roles.slice(1).forEach(role => {
            if (counts[role] === undefined) {
                counts[role] = 0;
            }
        });
        
        return counts;
    }, [employees]);

    // 💡 Logic ในการกรองข้อมูล (ใช้ useMemo เพื่อประสิทธิภาพ)
    const filteredEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.filter(emp => {
            // emp.role ถูก normalize มาจาก AdminDashboard แล้ว
            const normalizedRole = emp.role || 'N/A'; 
            
            // กรองตาม Tab ที่เลือก
            const matchesTab = activeTab === "All" || normalizedRole === activeTab;
            
            // กรองตาม Search Term (ตรวจสอบ name ก่อนเข้าถึง .toLowerCase())
            const matchesSearch = (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesTab && matchesSearch;
        });
    }, [employees, searchTerm, activeTab]);

    // 💡 Handler สำหรับนำทางไปหน้ารายละเอียดเมื่อคลิก Card
    const handleEmployeeClick = (employee) => {
        navigate(`/admin/detail/${employee._id}`); 
    };

    if (loading) {
        return <div className="text-center p-8 text-xl text-gray-600">กำลังโหลดข้อมูลพนักงาน...</div>;
    }
    
    // ⭐️ ฟังก์ชันสำหรับแสดงผล Tab Navigation (รวมโค้ด RoleTabs ไว้ในไฟล์นี้)
    const renderRoleTabs = () => {
        const getTabClasses = (role) => 
            `px-4 py-2 font-semibold cursor-pointer transition-all duration-200 
            ${activeTab === role 
                ? 'border-b-4 border-green-500 text-green-700 bg-green-50' 
                : 'text-gray-600 hover:text-green-500 hover:bg-gray-50'}`;
        
        return (
            <div className="flex justify-start border-b border-gray-200 mb-6 overflow-x-auto">
                {/* ใช้ roles list หลักในการ render tab เพื่อให้ลำดับถูกต้อง */}
                {roles.map((role) => (
                    <div 
                        key={role}
                        className={getTabClasses(role)}
                        onClick={() => setActiveTab(role)}
                    >
                        {role}
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                            {/* แสดงจำนวนที่นับได้ */}
                            {roleCounts[role] || 0} 
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // 💡 ส่วนสำหรับแสดงข้อความเมื่อไม่พบข้อมูล
    const renderNoData = () => (
        <div className="text-center text-gray-500 p-10 border border-dashed rounded-xl mt-6">
            <p className="text-xl font-medium">ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไข</p>
            <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองตำแหน่ง</p>
        </div>
    );


    return (
        <div className="p-4 bg-white rounded-xl shadow-lg">
            
            {/* ⭐️ 1. Search Input Header ⭐️ */}
            <div className="mb-6 flex justify-between items-center flex-wrap">
                <div className="grow">
                    {/* สามารถเพิ่ม Title เช่น <h1 className="text-2xl font-bold">ข้อมูลพนักงาน</h1> ที่นี่ได้ */}
                </div>

                {/* ⭐️ ช่องค้นหาอยู่ทางขวา ⭐️ */}
                <div className="relative mt-2 sm:mt-0">
                    <input 
                        type="text"
                        placeholder="ค้นหาชื่อพนักงาน..."
                        className="p-2 border rounded-lg w-full sm:w-64 pl-10 focus:ring-green-500 focus:border-green-500" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {/* Icon ค้นหา */}
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="20"
                        height="20"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                </div>
            </div>
            
            {/* 2. แทบ Tabs */}
            {renderRoleTabs()}
            
            {/* 3. แสดงรายการพนักงาน */}
            <div className="mt-6">
                 {filteredEmployees.length === 0 ? (
                    renderNoData()
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredEmployees.map((emp) => (
                            <EmployeeCard
                                key={emp._id || emp.id} 
                                employee={emp}
                                onClick={() => handleEmployeeClick(emp)}
                            />
                        ))}
                    </div>
                 )}
            </div>
        </div>
    );
}