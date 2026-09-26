import { UserSession } from '../services/api';

export function generateWaInviteText(user?: UserSession | null): string {
  const rt = user?.rtNomor || '03';
  const rw = user?.rwNomor || '05';
  const kel = user?.kelurahanNama || 'Sukamaju';
  const ketua = user?.name || 'Ketua RT';

  return `*UNDANGAN RESMI WARGA RT ${rt} / RW ${rw}*
Kelurahan ${kel}
━━━━━━━━━━━━━━━━━━━━

Assalamu'alaikum Wr. Wb. & Salam Sejahtera Bapak/Ibu Warga RT ${rt} / RW ${rw},

Demi meningkatkan ketertiban administrasi, kemudahan pembayaran iuran kas RT secara transparan, pembuatan surat pengantar digital, dan keamanan lingkungan kita, pengurus RT mengimbau seluruh warga untuk mengunduh aplikasi resmi *RtHub*:

📲 *Download Aplikasi Android (APK):*
https://rthub.id/downloads/rthub-latest.apk
(Website resmi: https://rthub.id)

📝 *Langkah Pendaftaran Warga:*
1. Buka aplikasi RtHub lalu klik *"Daftar Akun Baru"*
2. Pilih peran sebagai *"Warga"*
3. Pilih wilayah lingkungan kita:
   • Kelurahan: *${kel}*
   • RW: *${rw}*
   • RT: *${rt}*
4. Masukkan Nama Lengkap, No. WhatsApp, dan Blok/No. Rumah Anda.
5. Masukkan kode verifikasi OTP yang dikirimkan.

✨ *Fitur yang dapat dinikmati warga:*
• Bayar iuran RT praktis via QRIS & Virtual Account Bank
• Cek transparansi pemasukan & pengeluaran kas RT secara real-time
• Buat Surat Pengantar RT online kapan saja
• Tombol Darurat (Panic Button) 24 jam ke pos satpam
• Informasi agenda & pengumuman lingkungan terkini

Mari bersama-sama wujudkan lingkungan RT yang rukun, aman, dan modern!

Terima kasih atas kerja samanya,
*Pengurus RT ${rt} / RW ${rw}*
${ketua}`;
}
