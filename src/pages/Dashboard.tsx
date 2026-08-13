import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Users, Trophy, Map, ChevronRight, Lock } from 'lucide-react';
import { useStore } from '../store';
import { MatchMode, Match } from '../types';
import { cn } from '../utils';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<MatchMode>('Solo');
  const { matches, currentUser } = useStore();
  const navigate = useNavigate();

  const filteredMatches = matches.filter(m => m.mode === activeTab);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <section className="flex flex-col items-center text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
          BATTLE FOR GLORY
        </h1>
        <p className="text-gray-400 max-w-lg text-sm md:text-base">
          Join daily Free Fire tournaments, showcase your skills, and earn real cash rewards instantly.
        </p>
      </section>

      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-white/10 bg-[#121212] p-1">
          {(['Solo', 'Duo', 'Squad'] as MatchMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveTab(mode)}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-all",
                activeTab === mode 
                  ? "bg-white text-black shadow-lg" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Match Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map((match, i) => (
          <MatchCard key={match.id} match={match} index={i} onClick={() => navigate(`/match/${match.id}`)} />
        ))}
        {filteredMatches.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No {activeTab} matches scheduled right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const MatchCard: React.FC<{ match: Match, index: number, onClick: () => void }> = ({ match, index, onClick }) => {
  const isFull = match.joinedSeats >= match.totalSeats;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121212] hover:border-white/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white mb-2">
              {match.status === 'upcoming' ? 'UPCOMING' : 'LIVE'}
            </div>
            <h3 className="text-xl font-bold text-white">{match.title}</h3>
          </div>
          <div className="text-right">
            <span className="block text-2xl font-bold text-white">₹{match.entryFee}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Entry Fee</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Map className="h-4 w-4" />
            <span>{match.map}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{new Date(match.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="h-4 w-4" />
            <span>{match.joinedSeats}/{match.totalSeats} Joined</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 p-4 mb-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Per Kill Reward</span>
            <span className="font-bold text-white">₹{match.perKillReward}</span>
          </div>
          <div className="mt-2 flex justify-between items-center text-sm">
            <span className="text-gray-400">BOOYAH Bonus</span>
            <span className="font-bold text-white">₹{match.booyahBonus}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 bg-white/5 px-6 py-4 transition-colors group-hover:bg-white/10">
        <span className="text-sm font-bold text-white">
          {isFull ? 'MATCH FULL' : 'VIEW DETAILS'}
        </span>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
      </div>
    </motion.div>
  );
}
