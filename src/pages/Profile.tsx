import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { User, Phone, Gamepad2, Award, History, CheckCircle2, LogOut, Calendar, Map, Trophy } from 'lucide-react';
import { useStore } from '../store';

export default function Profile() {
  const { currentUser, logoutUser, updateUserProfile, transactions, matches } = useStore();
  const navigate = useNavigate();

  const [ign, setIgn] = useState(currentUser?.ign || '');
  const [uid, setUid] = useState(currentUser?.uid || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saved, setSaved] = useState(false);

  // Calculate Total Earnings (only from 'winnings' type transactions)
  const winningTransactions = transactions.filter(t => t?.userId === currentUser?.id && t?.type === 'winnings' && t?.status === 'approved');
  const totalEarnings = winningTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate Wins (Booyahs) - assuming admin records "Rank 1" in transaction reason
  const totalWins = winningTransactions.filter(t => t.reason?.toLowerCase().includes('rank 1')).length;

  // Match History
  const matchHistory = matches.filter(m => m.participants.some(p => p.userId === currentUser.id));
  const totalMatches = matchHistory.length;

  useEffect(() => {
    if (totalEarnings > 0) {
      // Fire celebratory confetti on mount if they have earnings
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#eab308', '#ffffff', '#22c55e'] // Yellow, White, Green
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#eab308', '#ffffff', '#22c55e']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [totalEarnings]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile(ign, uid, phone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:w-1/3 rounded-2xl border border-white/10 bg-[#121212] p-8 flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden bg-[#0A0A0A] mb-4">
            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{currentUser.ign}</h2>
          <p className="text-sm text-gray-400 mb-6">UID: {currentUser.uid}</p>
          
          <button 
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/20 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full md:w-2/3 rounded-2xl border border-white/10 bg-[#121212] p-8"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <User className="h-5 w-5 text-gray-400" />
            Edit Profile Details
          </h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Gamepad2 className="h-4 w-4" /> In-Game Name (IGN)
                </label>
                <input
                  type="text"
                  required
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Gamepad2 className="h-4 w-4" /> Free Fire UID
                </label>
                <input
                  type="text"
                  required
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Phone className="h-4 w-4" /> Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <button
                type="submit"
                className="rounded-lg bg-white px-6 py-2.5 font-bold text-black transition-colors hover:bg-gray-200"
              >
                Save Changes
              </button>
              {saved && (
                <span className="flex items-center gap-2 text-sm text-green-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Saved Successfully
                </span>
              )}
            </div>
          </form>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0A0A0A] p-6 text-center group hover:border-blue-500/30 transition-all duration-300"
        >
          <div className="mb-4 inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Matches Played</p>
          <h2 className="text-3xl font-bold text-white tracking-tighter">{totalMatches}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0A0A0A] p-6 text-center group hover:border-yellow-500/30 transition-all duration-300"
        >
          <div className="mb-4 inline-flex p-3 rounded-xl bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Booyahs (Wins)</p>
          <h2 className="text-3xl font-bold text-yellow-500 tracking-tighter drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">{totalWins}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0A0A0A] p-6 text-center group hover:border-green-500/30 transition-all duration-300"
        >
          <div className="mb-4 inline-flex p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Total Earnings</p>
          <h2 className="text-3xl font-bold text-green-500 tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">₹{totalEarnings.toFixed(2)}</h2>
        </motion.div>
      </div>

      {/* Match History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden flex flex-col"
      >
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-gray-400" />
              Match History
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0 max-h-64">
            {matchHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Gamepad2 className="h-10 w-10 mb-3 opacity-20" />
                <p>No matches played yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {matchHistory.map(match => (
                  <div key={match.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <h4 className="font-bold text-white text-sm">{match.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Map className="w-3 h-3" /> {match.map}</span>
                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {match.mode}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(match.startTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        match.status === 'completed' ? 'border-gray-500/30 text-gray-400 bg-gray-500/10' :
                        match.status === 'live' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                        'border-green-500/30 text-green-400 bg-green-500/10'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
  );
}
