const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://rthub.hendraoktora.com/api';

export interface UserSession {
  id: string;
  phone: string;
  email?: string | null;
  role: string;
  name: string;
  rtId?: string;
  rtNomor?: string;
  rwNomor?: string;
  kelurahanNama?: string;
  wilayah: string;
  token: string;
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem('rthub_admin_token');
  },

  setToken(token: string) {
    localStorage.setItem('rthub_admin_token', token);
  },

  getUser(): UserSession | null {
    const raw = localStorage.getItem('rthub_admin_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user: UserSession) {
    localStorage.setItem('rthub_admin_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('rthub_admin_token');
    localStorage.removeItem('rthub_admin_user');
  },

  async login(username: string, password: string): Promise<{ user: UserSession; accessToken: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login gagal' }));
      throw new Error(err.message || 'Nomor WhatsApp / Email atau kata sandi salah.');
    }

    const data = await res.json();
    const u = data.user;
    const session: UserSession = {
      id: u.id,
      phone: u.phone,
      email: u.email,
      role: u.role,
      name: u.profile?.namaLengkap || (u.role === 'SUPERADMIN' ? 'Superadmin Platform' : 'Pengurus RT'),
      rtId: u.rtId,
      rtNomor: u.rt?.nomor || (u.role === 'SUPERADMIN' ? '-' : '03'),
      rwNomor: u.rw?.nomor || (u.role === 'SUPERADMIN' ? '-' : '05'),
      kelurahanNama: u.kelurahan?.nama || (u.role === 'SUPERADMIN' ? 'Nasional' : 'Sukamaju'),
      wilayah: u.role === 'SUPERADMIN'
        ? 'Platform Owner (Nasional)'
        : `RT ${u.rt?.nomor || '03'} / RW ${u.rw?.nomor || '05'} - ${u.kelurahan?.nama || 'Sukamaju'}`,
      token: data.accessToken,
    };

    this.setToken(data.accessToken);
    this.setUser(session);
    return { user: session, accessToken: data.accessToken };
  },

  async getKasSummary(rtId?: string) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/kas/summary`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal memuat saldo kas RT');
    return res.json();
  },

  async catatKas(data: { tipe: string; kategori: string; nominal: number; keterangan: string }) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/kas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal mencatat mutasi kas');
    return res.json();
  },

  async getWargaList(rtId: string) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/wilayah/rt/${rtId}/warga`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal memuat data warga RT');
    return res.json();
  },

  async addWarga(rtId: string, data: any) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/wilayah/rt/${rtId}/warga`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Gagal menambah warga' }));
      throw new Error(err.message || 'Gagal menambah warga');
    }
    return res.json();
  },

  async getLaporanList() {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/laporan`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal memuat laporan warga');
    return res.json();
  },

  async createLaporan(data: any) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/laporan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal mengirim laporan');
    return res.json();
  },

  async getLapakList() {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/lapak`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal memuat lapak warga');
    return res.json();
  },

  async createLapak(data: any) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/lapak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal memasang produk lapak');
    return res.json();
  },

  async getAllRtSummary() {
    const res = await fetch(`${API_BASE_URL}/wilayah/rt-summary-all`);
    if (!res.ok) throw new Error('Gagal memuat ringkasan RT');
    return res.json();
  },

  // Agenda Kegiatan
  async getAgendaList() {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/agenda`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal memuat agenda kegiatan');
    return res.json();
  },

  async createAgenda(data: any) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/agenda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal menambahkan agenda kegiatan');
    return res.json();
  },

  async updateAgenda(id: string, data: any) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/agenda/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal memperbarui agenda kegiatan');
    return res.json();
  },

  async deleteAgenda(id: string) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/agenda/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal menghapus agenda kegiatan');
    return res.json();
  },

  // Berita & Pengumuman
  async getBeritaFeed() {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/berita/feed`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal memuat berita / pengumuman');
    return res.json();
  },

  async createBerita(data: any) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/berita`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal mempublikasikan pengumuman');
    return res.json();
  },

  async updateBerita(id: string, data: any) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/berita/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal memperbarui pengumuman');
    return res.json();
  },

  async deleteBerita(id: string) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/berita/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Gagal menghapus pengumuman');
    return res.json();
  },
};
