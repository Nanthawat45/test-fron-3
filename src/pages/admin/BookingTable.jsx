import React from "react";
import { useState, useEffect, Fragment } from "react"; 
import { Dialog, Transition } from "@headlessui/react";
import BookingService from "../../service/bookingService"; 
import {
  UserRound, Clock, Users, ClipboardList, UserCheck, RefreshCw, Trash2, Hash,
} from "lucide-react"; 

const initialMessage = { text: "", type: "" };

export default function BookingTable() {
  const [selected, setSelected] = useState(null); 
  const [holeFilter, setHoleFilter] = useState("all"); 
  const [bookings, setBookings] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState(""); 
  const [isModalLoading, setIsModalLoading] = useState(false); 
  const [message, setMessage] = useState(initialMessage);

  const activeColor = "#4F6767"; 
  const hoverColor = "#3d5151"; 

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(initialMessage), 5000);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await BookingService.getTodayBookings();
      if (response.data) {
        setBookings(response.data.bookings || []);
      } else {
        setError(response.message || "ไม่สามารถโหลดข้อมูลการจองได้");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (booking) => {
    setSelected(booking); 
    setNewTimeSlot(booking.timeSlot);
    setIsUpdateModalOpen(true); 
    setIsModalLoading(false); 
  };

  const handleDeleteClick = (booking) => {
    setSelected(booking);
    setIsDeleteModalOpen(true);
    setIsModalLoading(false); 
  };

  const handleUpdateConfirm = async () => {
    if (!selected || !newTimeSlot || isModalLoading) return;

    if (newTimeSlot === selected.timeSlot) {
      showMessage("เวลาที่เลือกยังเหมือนเดิม", "error");
      return;
    }

    setIsModalLoading(true);

    try {
      console.log("Sending update:", selected._id, { timeSlot: newTimeSlot });
      const response = await BookingService.updateBooking(selected._id, { timeSlot: newTimeSlot });
      console.log("Update response:", response.data);

      if (response.data?.booking) {
        const updatedBookings = bookings.map((b) =>
          b._id === selected._id ? response.data.booking : b
        );
        setBookings(updatedBookings);
        setSelected(null);
        setIsUpdateModalOpen(false);
        showMessage("อัปเดตการจองสำเร็จ!", "success");
      } else {
        showMessage(response.data?.message || "อัปเดตไม่สำเร็จ", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("เกิดข้อผิดพลาดในการอัปเดตเวลา", "error");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selected || isModalLoading) return;
    setIsModalLoading(true);

    try {
      console.log("Deleting booking:", selected._id);
      const response = await BookingService.deleteBooking(selected._id);
      console.log("Delete response:", response.data);

      if (response.data?.message === "Booking deleted successfully") {
        const remainingBookings = bookings.filter((b) => b._id !== selected._id);
        setBookings(remainingBookings);
        setSelected(null);
        setIsDeleteModalOpen(false);
        showMessage("ลบการจองสำเร็จ!", "success");
      } else {
        showMessage(response.data?.message || "ลบไม่สำเร็จ", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("เกิดข้อผิดพลาดในการลบ", "error");
    } finally {
      setIsModalLoading(false);
    }
  };

  const times = Array.from({ length: 45 }).map((_, index) => {
    const hour = Math.floor(index / 4) + 6;
    const min = (index % 4) * 15;
    return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
  });

  const filteredTimes = times.filter((time) => {
    if (holeFilter === "9") return time >= "12:15" && time <= "17:00";
    if (holeFilter === "18") return time <= "12:00";
    return true;
  });

  const availableTimes = filteredTimes.filter(time => {
    const isBooked = bookings.some(b => b.timeSlot === time);
    const isOriginalTime = selected && selected.timeSlot === time;
    return !isBooked || isOriginalTime;
  });

  function FilterButton({ label, value }) {
    const isActive = holeFilter === value;
    return (
      <button
        className="px-4 py-2 rounded-full border transition-colors duration-200"
        onClick={() => setHoleFilter(value)}
        style={{
          backgroundColor: isActive ? activeColor : "white",
          color: isActive ? "white" : activeColor,
          borderColor: activeColor,
        }}
        onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = hoverColor)}
        onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = "white")}
      >
        {label}
      </button>
    );
  }

  if (loading) return <div className="text-center p-8">กำลังโหลดข้อมูลการจอง...</div>;
  if (error) return <div className="text-center p-8 text-red-500">เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className="p-4 bg-white shadow rounded-xl overflow-x-auto">
      {message.text && (
        <div className={`p-4 mb-4 rounded-lg text-center font-bold ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="mb-4 flex gap-3">
        <FilterButton label="9 หลุม" value="9" />
        <FilterButton label="18 หลุม" value="18" />
        <FilterButton label="ทั้งหมด" value="all" />
      </div>

      <table className="min-w-full text-sm text-center border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {[{ icon: Hash, label: "คิว" }, { icon: UserRound, label: "แคดดี้" }, { icon: Clock, label: "เวลา" }, { icon: Users, label: "ชื่อกลุ่ม" }, { icon: ClipboardList, label: "จำนวนผู้เล่น" }, { icon: UserCheck, label: "ชื่อผู้จอง" }, { icon: RefreshCw, label: "เลื่อนเวลา" }, { icon: Trash2, label: "ยกเลิก" }].map((col, idx) => (
              <th key={idx} className="px-2 py-2 border">
                <div className="flex flex-col items-center justify-center">
                  <col.icon size={18} className="mb-1" />
                  <span>{col.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredTimes.map((time, index) => {
            const booking = bookings.find((b) => b.timeSlot === time);
            return (
              <tr
                key={time}
                className={`h-10 ${booking ? "bg-green-100 hover:bg-green-200 cursor-pointer" : ""}`}
                onClick={() => booking && setSelected(booking)}
              >
                <td>{index + 1}</td>
                <td className="text-xs font-mono">{booking?.caddy?.map((c) => c.name).join(" ")}</td>
                <td className="text-orange-600 font-mono">{time}</td>
                {booking ? (
                  <>
                    <td className="font-semibold">{booking.groupName}</td>
                    <td>{booking.bookedPlayers}</td>
                    <td>{booking.teamName}</td>
                    <td>
                      <button
                        className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full hover:bg-gray-500"
                        onClick={() => handleUpdateClick(booking)}
                      >
                        เลื่อนเวลา
                      </button>
                    </td>
                    <td>
                      <button
                        className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full hover:bg-red-500"
                        onClick={() => handleDeleteClick(booking)}
                      >
                        ยกเลิก
                      </button>
                    </td>
                  </>
                ) : (
                  <td colSpan={6}></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal เลื่อนเวลา */}
      <Transition appear show={isUpdateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !isModalLoading && setIsUpdateModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold leading-6 text-gray-900">เลื่อนเวลาการจอง</h3>
                  </Dialog.Title>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-700 mb-4 font-semibold">
                      กำลังเลื่อนเวลาของ <span className="text-indigo-600 font-extrabold">{selected?.groupName}</span> จาก <span className="text-indigo-600 font-extrabold">{selected?.timeSlot}</span>
                    </p>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เวลาใหม่ ({holeFilter === '9' ? '9 หลุม' : holeFilter === '18' ? '18 หลุม' : 'ทั้งหมด'})</label>
                    <div className="mt-2 grid grid-cols-4 gap-2 md:grid-cols-5 lg:grid-cols-6 max-h-60 overflow-y-auto p-1 border rounded-lg bg-gray-50">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setNewTimeSlot(time)}
                          className={`px-2 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 ${newTimeSlot === time ? "bg-green-700 text-white shadow-md" : "bg-gray-200 text-gray-900 hover:bg-gray-300"} ${time === selected?.timeSlot ? 'border-2 border-indigo-500 !bg-indigo-100 text-indigo-900' : ''}`}
                        >
                          {time}
                        </button>
                      ))}
                      {availableTimes.length === 0 && <p className="col-span-6 text-center text-sm text-gray-500 py-4">ไม่พบเวลาที่ว่าง</p>}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md border bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleUpdateConfirm}
                      disabled={isModalLoading || !newTimeSlot || newTimeSlot === selected?.timeSlot}
                    >
                      {isModalLoading ? 'กำลังบันทึก...' : 'ยืนยันการเลื่อนเวลา'}
                    </button>

                    <button
                      type="button"
                      className="rounded-md border bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
                      onClick={() => !isModalLoading && setIsUpdateModalOpen(false)}
                      disabled={isModalLoading}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal ยกเลิก */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !isModalLoading && setIsDeleteModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">ยืนยันการยกเลิกการจอง</Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองของ <strong>{selected?.groupName}</strong> เวลา <strong>{selected?.timeSlot}</strong>?
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleDeleteConfirm}
                      disabled={isModalLoading}
                    >
                      {isModalLoading ? 'กำลังลบ...' : 'ยืนยันการยกเลิก'}
                    </button>

                    <button
                      type="button"
                      className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:opacity-50"
                      onClick={() => !isModalLoading && setIsDeleteModalOpen(false)}
                      disabled={isModalLoading}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
