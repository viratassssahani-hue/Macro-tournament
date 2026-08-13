import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Shield, Clock, AlertTriangle, EyeOff } from 'lucide-react';
import { useStore } from '../store';

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, currentUser, joinMatch } = useStore();
  const match = matches.find(m => m.id === id);

  const [joining, setJoining] = useState(false);
  const [teammates, setTeammates] = useState([{ ign: '', uid: '' }, { ign: '', uid: '' }, { ign: '', uid: '' }]);

  if (!match) return <div className="text-center text-white py-20">Match not found</div>;

  const isJoined = currentUser && match.participants.some(p => p.userId === currentUser.id);
  const isFull = match.joinedSeats >= match.totalSeats;
  const teamSize = match.mode === 'Solo' ? 1 : match.mode === 'Duo' ? 2 : 4;
  
  // Calculate if room details should be visible (10 mins before start)
  const startTime = new Date(match.startTime).getTime();
  const now = new Date().getTime();
  const showRoomDetails = isJoined && (startTime - now <= 10 * 60 * 1000);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Construct participants array
    const participants = [{ ign: currentUser.ign, uid: currentUser.uid }];
    for (let i = 0; i < teamSize - 1; i++) {
       participants.push(teammates[i]);
    }
    
    const success = joinMatch(match.id, participants);
    if (!success) {
      alert('Insufficient wallet balance to join!');
      navigate('/wallet');
    } else {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Arena
      </button>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
        <div className="border-b border-white/10 p-8">
          <div className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white">
            {match.mode} Match
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{match.title}</h1>
          <p className="text-gray-400 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            {new Date(match.startTime).toLocaleString()}
          </p>
        </div>

        {/* Room Details Modal/Section for Joined Players */}
        {isJoined && (
          <div className="border-b border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Your Match Credentials
            </h3>
            {showRoomDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Room ID</p>
                  <p className="text-xl font-mono text-white">{match.roomId || 'Waiting for Admin...'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Password</p>
                  <p className="text-xl font-mono text-white">{match.roomPassword || 'Waiting...'}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-6 text-center text-gray-400 flex flex-col items-center">
                <EyeOff className="h-8 w-8 mb-3 opacity-50" />
                <p>Room ID and Password will be revealed here 10 minutes before the match starts.</p>
              </div>
            )}
          </div>
        )}

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Prize Pool & Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Entry Fee</span>
                <span className="font-bold text-white">₹{match.entryFee} {teamSize > 1 ? '(Total)' : ''}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Per Kill Reward</span>
                <span className="font-bold text-white">₹{match.perKillReward}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">BOOYAH Bonus</span>
                <span className="font-bold text-white">₹{match.booyahBonus}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Map</span>
                <span className="font-bold text-white">{match.map}</span>
              </div>
            </div>
            
            {!isJoined && !isFull && (
              <button
                onClick={() => setJoining(!joining)}
                className="w-full rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-gray-200 uppercase tracking-wider"
              >
                {joining ? 'Cancel Booking' : `Book Slot (₹${match.entryFee})`}
              </button>
            )}
            
            {isJoined && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center text-green-400 font-medium">
                You have successfully joined this match!
              </div>
            )}
            
            {!isJoined && isFull && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400 font-medium">
                Match is currently full.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <span>Slots ({match.joinedSeats}/{match.totalSeats})</span>
              <Users className="h-5 w-5 text-gray-400" />
            </h3>
            
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {Array.from({ length: match.totalSeats }).map((_, i) => {
                const isOccupied = i < match.joinedSeats;
                return (
                  <div 
                    key={i}
                    className={`aspect-square rounded-md flex items-center justify-center text-xs font-mono
                      ${isOccupied 
                        ? 'bg-white/20 text-white/50 border border-white/5' 
                        : 'bg-[#0A0A0A] text-gray-500 border border-white/10'}`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Overlay */}
      {joining && !isJoined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-[#121212] p-8 shadow-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-6">Confirm Team Details</h3>
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="rounded-lg border border-white/5 bg-[#0A0A0A] p-4">
              <p className="text-sm font-bold text-white mb-2">Slot 1 (You)</p>
              <p className="text-sm text-gray-400">IGN: <span className="text-white">{currentUser?.ign}</span></p>
              <p className="text-sm text-gray-400">UID: <span className="text-white">{currentUser?.uid}</span></p>
            </div>

            {teamSize > 1 && Array.from({ length: teamSize - 1 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <p className="text-sm font-bold text-white border-b border-white/5 pb-2">Slot {i + 2}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">Teammate IGN</label>
                    <input
                      type="text"
                      required
                      value={teammates[i].ign}
                      onChange={(e) => {
                        const newTeammates = [...teammates];
                        newTeammates[i].ign = e.target.value;
                        setTeammates(newTeammates);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-white text-sm focus:border-white/30 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">Teammate UID</label>
                    <input
                      type="text"
                      required
                      value={teammates[i].uid}
                      onChange={(e) => {
                        const newTeammates = [...teammates];
                        newTeammates[i].uid = e.target.value;
                        setTeammates(newTeammates);
                      }}
                      className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-white text-sm focus:border-white/30 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-500/80 flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>Entry fee of ₹{match.entryFee} will be deducted from your wallet immediately. Make sure your wallet has sufficient balance.</p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-gray-200 uppercase tracking-wider"
            >
              Confirm & Pay ₹{match.entryFee}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
