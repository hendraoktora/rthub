import React, { useState } from 'react';
import { Lock, Phone, ArrowRight, UserCheck, Crown, Wallet, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { api, UserSession } from '../services/api';

interface LoginProps {
  onLogin: (user: UserSession) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('081111111111');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { user } = await api.login(username.trim(), password.trim());
      onLogin(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa kembali nomor WhatsApp dan kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (phone: string) => {
    setUsername(phone);
    setPassword('Password123!');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border border-slate-700/70 p-8 rounded-3xl shadow-2xl relative z-10 text-white">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/30 mb-3">
            Rt
          </div>
          <h2 className="text-2xl font-bold tracking-tight">RtHub Admin Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Sistem Manajemen Lingkungan RT/RW & Platform Multi-Tenant (Live DB)</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Demo Quick Logins per Real DB Accounts */}
        <div className="mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2.5 tracking-wider">⚡ 1-Click Quick Isi Akun Real DB:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('081111111111')}
              className="p-2.5 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition"
            >
              <Crown size={16} />
              <span>1. Superadmin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('081234567890')}
              className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition"
            >
              <UserCheck size={16} />
              <span>2. RT 03 Sukamaju</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('085280039433')}
              className="p-2.5 bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30 text-amber-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition"
            >
              <UserCheck size={16} />
              <span>3. RT 04 Kota Baru (Baru)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('081398765432')}
              className="p-2.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition"
            >
              <Wallet size={16} />
              <span>4. Bendahara RT</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('087812345678')}
              className="p-2.5 bg-cyan-600/20 border border-cyan-500/30 hover:bg-cyan-600/30 text-cyan-300 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition sm:col-span-2"
            >
              <Shield size={16} />
              <span>5. Satpam Pos Jaga</span>
            </button>
          </div>
        </div>

        {/* Form Login Real */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nomor WhatsApp / Username Terdaftar</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Memverifikasi Database...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
