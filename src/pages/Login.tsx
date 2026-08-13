import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Gamepad2, AlertTriangle, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [ign, setIgn] = useState('');
  const [uid, setUid] = useState('');
  const { loginUser, currentUser, updateUserProfile } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<'google' | 'profile'>('google');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.ign && currentUser.uid) {
        navigate('/');
      } else {
        setStep('profile');
      }
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    await loginUser();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ign.trim() && uid.trim()) {
      await updateUserProfile(ign, uid, '');
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <Gamepad2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-white">PLAYER LOGIN</h2>
          <p className="mt-2 text-sm text-gray-400">Enter your Free Fire details to continue</p>
        </div>

        {step === 'google' ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-400 font-medium">
              We now use Google Authentication to secure your wallet and match history.
            </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-gray-200 uppercase tracking-wider"
            >
              <LogIn className="w-5 h-5" /> Sign in with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">In-Game Name (IGN)</label>
              <input
                type="text"
                required
                value={ign}
                onChange={(e) => setIgn(e.target.value)}
                placeholder="e.g. SK SABIR BOSS"
                className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white placeholder-gray-600 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">Free Fire UID</label>
              <input
                type="text"
                required
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="e.g. 555432123"
                className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white placeholder-gray-600 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>

            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mt-4 text-xs text-red-400 font-medium flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Warning: You must enter your ORIGINAL Free Fire UID and IGN. Fake or mismatched details will result in getting kicked from the match room without refund.</p>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-gray-200 uppercase tracking-wider"
            >
              Complete Registration
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-white/5 pt-4">
          <button 
            onClick={() => navigate('/admin')}
            className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-medium"
          >
            Admin Access Portal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
