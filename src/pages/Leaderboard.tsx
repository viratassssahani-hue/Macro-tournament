import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award } from 'lucide-react';
import { useStore } from '../store';

export default function Leaderboard() {
  const { leaderboard, currentUser } = useStore();
  
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Grandmaster': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Diamond': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'Gold': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Silver': return 'text-gray-300 bg-gray-300/10 border-gray-300/20';
      default: return 'text-orange-700 bg-orange-700/10 border-orange-700/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          GLOBAL RANKINGS
        </h1>
        <p className="text-gray-400 text-sm">Points = Placement + (Kills × 10)</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 md:gap-8 mt-16 h-64">
        {/* 2nd Place */}
        {top3[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-gray-400 font-bold">2nd</div>
              <img src={top3[1].avatar} className="w-16 h-16 rounded-full border-4 border-gray-400 bg-[#121212]" alt="2nd" />
            </div>
            <div className="w-24 md:w-32 h-32 bg-gradient-to-t from-gray-400/20 to-transparent border-t border-gray-400/30 rounded-t-xl flex flex-col items-center justify-end pb-4">
              <p className="text-sm font-bold text-white w-full text-center truncate px-2">{top3[1].ign}</p>
              <p className="text-xs text-gray-400">{top3[1].points} pts</p>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-lg flex items-center"><Award className="w-5 h-5" /> 1st</div>
              <img src={top3[0].avatar} className="w-20 h-20 rounded-full border-4 border-yellow-400 bg-[#121212]" alt="1st" />
            </div>
            <div className="w-28 md:w-36 h-40 bg-gradient-to-t from-yellow-400/20 to-transparent border-t border-yellow-400/30 rounded-t-xl flex flex-col items-center justify-end pb-4 shadow-[0_-10px_30px_rgba(250,204,21,0.1)]">
              <p className="text-base font-bold text-white w-full text-center truncate px-2">{top3[0].ign}</p>
              <p className="text-sm font-bold text-yellow-400">{top3[0].points} pts</p>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-orange-400 font-bold">3rd</div>
              <img src={top3[2].avatar} className="w-16 h-16 rounded-full border-4 border-orange-400 bg-[#121212]" alt="3rd" />
            </div>
            <div className="w-24 md:w-32 h-24 bg-gradient-to-t from-orange-400/20 to-transparent border-t border-orange-400/30 rounded-t-xl flex flex-col items-center justify-end pb-4">
              <p className="text-sm font-bold text-white w-full text-center truncate px-2">{top3[2].ign}</p>
              <p className="text-xs text-gray-400">{top3[2].points} pts</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rest of Leaderboard */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0A0A0A] text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Player</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Tier</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rest.map((entry) => (
                <tr key={entry.userId} className={`hover:bg-white/5 transition-colors ${currentUser?.id === entry.userId ? 'bg-white/5' : ''}`}>
                  <td className="px-6 py-4 text-gray-400">#{entry.rank}</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={entry.avatar} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                    <span className="font-medium text-white">{entry.ign}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTierColor(entry.tier)}`}>
                      {entry.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Sticky User Rank */}
      {currentUser && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-white/10 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Your Rank</span>
              <span className="text-xl font-bold text-white">
                #{leaderboard.find(l => l.userId === currentUser.id)?.rank || 'Unranked'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-sm">Total Points</span>
              <p className="font-bold text-white">{leaderboard.find(l => l.userId === currentUser.id)?.points || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
