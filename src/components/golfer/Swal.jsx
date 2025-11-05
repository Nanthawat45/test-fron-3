import Swal from "sweetalert2";

export const blackMixin = Swal.mixin({
  buttonsStyling: false,
  background: "#fff",
  color: "#0f172a",
  showCloseButton: true,
  customClass: {
    popup: "rounded-2xl",
    title: "font-medium tracking-tight",
    htmlContainer: "text-slate-600",
    confirmButton:
      "swal2-confirm !rounded-full !px-5 !py-2.5 !bg-slate-900 hover:!bg-black !text-white !font-medium",
    cancelButton:
      "swal2-cancel !rounded-full !px-5 !py-2.5 !bg-slate-100 hover:!bg-slate-200 !text-slate-900 !font-medium",
    denyButton:
      "swal2-deny !rounded-full !px-5 !py-2.5 !bg-rose-600 hover:!bg-rose-700 !text-white !font-medium",
    closeButton: "!text-slate-400 hover:!text-slate-600",
  },
});

//   success draggable
export function alertSuccessDraggable(title = "Drag me!") {
  return blackMixin.fire({
    title,
    icon: "success",
    draggable: true,
  });
}

//  ตัวอย่างที่ขอ: question
export function alertQuestion(title = "The Internet?", text = "That thing is still around?") {
  return blackMixin.fire({
    title,
    text,
    icon: "question",
  });
}

//  แบบยืนยัน (ใช้แทน swalWithBootstrapButtons แต่โทนดำ)
export async function confirmBlack({
  title = "Are you sure?",
  text = "You won't be able to revert this!",
  icon = "warning",
  confirmText = "Yes, do it!",
  cancelText = "No, cancel!",
  reverseButtons = true,
} = {}) {
  const res = await blackMixin.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons,
    focusCancel: true,
    backdrop: "rgba(0,0,0,0.15)",
  });
  return res;
}

//  toast โทนดำ
export function toastBlack(title = "Done", icon = "success") {
  return blackMixin.fire({
    toast: true,
    position: "top",
    icon,
    title,
    timer: 1400,
    showConfirmButton: false,
    background: "#fff",
    color: "#0f172a",
    customClass: { popup: "rounded-xl shadow-md" },
  });
}