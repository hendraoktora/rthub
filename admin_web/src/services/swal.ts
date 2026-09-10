import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const showAlert = {
  success: (title: string, text?: string) =>
    Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        confirmButton: 'rounded-xl px-5 py-2 font-medium',
      },
    }),

  error: (title: string, text?: string) =>
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Tutup',
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        confirmButton: 'rounded-xl px-5 py-2 font-medium',
      },
    }),

  toastSuccess: (title: string) =>
    Toast.fire({
      icon: 'success',
      title,
    }),

  toastError: (title: string) =>
    Toast.fire({
      icon: 'error',
      title,
    }),

  confirm: async (title: string, text?: string, confirmText: string = 'Ya, Lanjutkan') => {
    const res = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: confirmText,
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        confirmButton: 'rounded-xl px-5 py-2 font-medium',
        cancelButton: 'rounded-xl px-5 py-2 font-medium',
      },
    });
    return res.isConfirmed;
  },
};

export default showAlert;

