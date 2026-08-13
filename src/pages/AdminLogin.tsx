import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin, currentUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!currentUser) {
      setError('You must sign in with Google on the main player login page first before elevating your account to Admin.');
      return;
    }

    const success = await loginAdmin(adminId, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#121212] p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <ShieldCheck className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-red-500">ADMIN CONTROL PANEL</h2>
          <p className="mt-2 text-sm text-gray-400">Restricted Access Only</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">Admin ID</label>
            <input
              type="text"
              required
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-colors hover:bg-red-700 uppercase tracking-wider"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
}
