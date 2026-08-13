import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Shield, Clock, AlertTriangle, EyeOff, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, currentUser, joinMatch } = useStore();
  const match = matches.find(m => m.id === id);

  const [joining, setJoining] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [teammates, setTeammates] = useState([{ ign: '', uid: '' }, { ign: '', uid: '' }, { ign: '', uid: '' }]);
  const [matchParticipants, setMatchParticipants] = useState<any[]>([]);

  React.useEffect(() => {
    if (!id) return;
    const q = collection(db, 'matches', id, 'participants');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMatchParticipants(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [id]);

  if (!match) return <div className="text-center text-white py-20">Match not found</div>;

  const isJoined = currentUser && matchParticipants.some(p => p.userId === currentUser.id);
  const occupiedSlots = matchParticipants.map(p => p.slotNumber);
  const teamSize = match.mode === 'Solo' ? 1 : match.mode === 'Duo' ? 2 : 4;
  
  const startTime = new Date(match.startTime).getTime();
  const now = new Date().getTime();
  const showRoomDetails = isJoined && (startTime - now <= 10 * 60 * 1000);
  
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (selectedSlot === null) {
      alert('Please select a slot from the grid.');
      return;
    }
    
    // Construct participants array
    const participants = [{ ign: currentUser.ign, uid: currentUser.uid, slotNumber: selectedSlot }];
    for (let i = 0; i < teamSize - 1; i++) {
       participants.push({ ...teammates[i], slotNumber: selectedSlot + i + 1 });
    }
    
    setJoining(true);
    const success = await joinMatch(match.id, participants, match.entryFee);
    setJoining(false);
    
    if (!success) {
      alert('Action failed. Ensure you have sufficient balance and the match has available slots.');
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

        {/* Room Details section */}
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
            
            {!isJoined && (match.joinedSeats < match.totalSeats) && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 italic">Select a slot from the grid to join.</p>
                <button
                  disabled={selectedSlot === null}
                  onClick={() => setJoining(true)}
                  className={`w-full rounded-lg px-4 py-3 font-bold text-black transition-colors uppercase tracking-wider ${selectedSlot === null ? 'bg-gray-600 cursor-not-allowed' : 'bg-white hover:bg-gray-200'}`}
                >
                  Book Selected Slot {selectedSlot && `(#${selectedSlot})`}
                </button>
              </div>
            )}
            
            {isJoined && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center text-green-400 font-medium">
                You have successfully joined this match!
              </div>
            )}
            
            {!isJoined && (match.joinedSeats >= match.totalSeats) && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400 font-medium">
                Match is currently full.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <span>Slots Grid</span>
              <Users className="h-5 w-5 text-gray-400" />
            </h3>
            
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {Array.from({ length: match.totalSeats }).map((_, i) => {
                const slotNum = i + 1;
                const participant = matchParticipants.find(p => p.slotNumber === slotNum);
                const isOccupied = !!participant;
                const isSelected = selectedSlot === slotNum;

                return (
                  <button 
                    key={i}
                    disabled={isOccupied || isJoined}
                    onClick={() => setSelectedSlot(slotNum)}
                    className={`aspect-square rounded-md flex flex-col items-center justify-center text-[10px] font-mono transition-all relative group
                      ${isOccupied 
                        ? 'bg-white/10 text-white/30 border border-white/5 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-white text-black border-2 border-white ring-2 ring-white/20'
                          : 'bg-[#0A0A0A] text-gray-500 border border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                  >
                    <span className="font-bold">{slotNum}</span>
                    {isOccupied && (
                      <span className="truncate w-full px-1 text-[8px] text-white/50">{participant.ign}</span>
                    )}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#121212]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Overlay */}
      {joining && !isJoined && selectedSlot !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#121212] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">Match Registration</h3>
              <button onClick={() => setJoining(false)} className="text-gray-400 hover:text-white">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleJoin} className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                Selected Slot: <strong>#{selectedSlot}</strong> {teamSize > 1 ? `to #${selectedSlot + teamSize - 1}` : ''}
              </div>

              <div className="rounded-lg border border-white/5 bg-[#0A0A0A] p-4">
                <p className="text-sm font-bold text-white mb-2">Teammate 1 (You)</p>
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-sm text-gray-400">IGN: <span className="text-white font-mono">{currentUser?.ign}</span></p>
                  <p className="text-sm text-gray-400">UID: <span className="text-white font-mono">{currentUser?.uid}</span></p>
                </div>
              </div>

              {teamSize > 1 && Array.from({ length: teamSize - 1 }).map((_, i) => (
                <div key={i} className="space-y-4 p-4 rounded-lg border border-white/5 bg-[#0A0A0A]">
                  <p className="text-sm font-bold text-white border-b border-white/10 pb-2">Teammate {i + 2} (Slot #{selectedSlot + i + 1})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">IGN</label>
                      <input
                        type="text"
                        required
                        value={teammates[i].ign}
                        onChange={(e) => {
                          const newTeammates = [...teammates];
                          newTeammates[i].ign = e.target.value;
                          setTeammates(newTeammates);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-[#121212] px-4 py-2 text-white text-sm focus:border-white/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">UID</label>
                      <input
                        type="text"
                        required
                        value={teammates[i].uid}
                        onChange={(e) => {
                          const newTeammates = [...teammates];
                          newTeammates[i].uid = e.target.value;
                          setTeammates(newTeammates);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-[#121212] px-4 py-2 text-white text-sm focus:border-white/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-500/80 flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>₹{match.entryFee} will be deducted. All slots must be valid for the match mode ({match.mode}).</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setJoining(false)}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 font-bold text-gray-400 transition-colors hover:bg-white/5 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-gray-200 uppercase tracking-wider"
                >
                  Pay & Register
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
