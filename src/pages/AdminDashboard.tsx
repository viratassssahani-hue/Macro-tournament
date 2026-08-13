import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Shield, Plus, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { MatchMode, Match } from '../types';

export default function AdminDashboard() {
  const { 
    isAdminAuthenticated, logoutAdmin, matches, transactions, leaderboard, users,
    adminCreateMatch, adminPublishRoom, adminCreditWinnings,
    adminApproveDeposit, adminRejectDeposit, adminMarkPaid, adminPenalty,
    adminDeleteMatch, adminUpdateMatchStatus
  } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'matches' | 'results' | 'deposits' | 'withdrawals' | 'audit' | 'users'>('matches');

  useEffect(() => {
    if (!isAdminAuthenticated) navigate('/admin');
  }, [isAdminAuthenticated, navigate]);

  if (!isAdminAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-red-500/30">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-red-500/20 bg-[#0A0A0A]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span className="text-xl font-bold tracking-wider text-red-500">ADMIN CONTROL</span>
          </div>
          <button 
            onClick={() => { logoutAdmin(); navigate('/admin'); }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Exit Panel
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 border-r border-white/10 bg-[#121212] p-4 flex md:flex-col gap-2 overflow-x-auto">
          {(['matches', 'results', 'deposits', 'withdrawals', 'audit', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 rounded-lg text-sm font-medium text-left capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {tab.replace('matches', 'Match Creator').replace('results', 'Spectator Results')}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'matches' && <MatchCreator adminCreateMatch={adminCreateMatch} matches={matches} adminPublishRoom={adminPublishRoom} adminDeleteMatch={adminDeleteMatch} adminUpdateMatchStatus={adminUpdateMatchStatus} />}
          {activeTab === 'results' && <SpectatorResults matches={matches} adminCreditWinnings={adminCreditWinnings} />}
          {activeTab === 'deposits' && <PendingDeposits transactions={transactions} approve={adminApproveDeposit} reject={adminRejectDeposit} />}
          {activeTab === 'withdrawals' && <PendingWithdrawals transactions={transactions} markPaid={adminMarkPaid} />}
          {activeTab === 'audit' && <UserAudit adminPenalty={adminPenalty} />}
          {activeTab === 'users' && <UserList users={users} />}
        </main>
      </div>
    </div>
  );
}

// --- Sub Components ---

function MatchCreator({ adminCreateMatch, matches, adminPublishRoom, adminDeleteMatch, adminUpdateMatchStatus }: any) {
  const [title, setTitle] = useState('');
  const [map, setMap] = useState('Bermuda');
  const [mode, setMode] = useState<MatchMode>('Solo');
  const [fee, setFee] = useState(20);
  const [perKill, setPerKill] = useState(10);
  const [booyah, setBooyah] = useState(100);
  const [time, setTime] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    adminCreateMatch({
      title, map, mode, entryFee: fee, perKillReward: perKill, booyahBonus: booyah,
      totalSeats: 48, startTime: new Date(time).toISOString()
    });
    alert('Match created!');
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-white/10 bg-[#121212] p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Create New Match
        </h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Title" required value={title} onChange={e=>setTitle(e.target.value)} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white" />
          <select value={map} onChange={e=>setMap(e.target.value)} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white">
            <option>Bermuda</option><option>Purgatory</option><option>Kalahari</option>
          </select>
          <select value={mode} onChange={e=>setMode(e.target.value as MatchMode)} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white">
            <option>Solo</option><option>Duo</option><option>Squad</option>
          </select>
          <input type="datetime-local" required value={time} onChange={e=>setTime(e.target.value)} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white" />
          <input type="number" placeholder="Entry Fee" required value={fee} onChange={e=>setFee(Number(e.target.value))} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white" />
          <input type="number" placeholder="Per Kill Reward" required value={perKill} onChange={e=>setPerKill(Number(e.target.value))} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white" />
          <input type="number" placeholder="BOOYAH Bonus" required value={booyah} onChange={e=>setBooyah(Number(e.target.value))} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white" />
          <button type="submit" className="md:col-span-2 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700">Create Match</button>
        </form>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#121212] p-6">
        <h3 className="text-xl font-bold text-white mb-4">Publish Room Credentials</h3>
        <div className="space-y-4">
          {matches.map((m: Match) => (
            <div key={m.id} className="flex flex-col md:flex-row items-center gap-4 bg-[#0A0A0A] border border-white/10 p-4 rounded-lg">
              <div className="flex-1">
                <p className="font-bold">{m.title} ({m.mode})</p>
                <p className="text-xs text-gray-400">{new Date(m.startTime).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input type="text" placeholder="Room ID" id={`rid-${m.id}`} defaultValue={m.roomId} className="bg-[#121212] border border-white/10 rounded p-2 text-sm w-32" />
                <input type="text" placeholder="Password" id={`rpwd-${m.id}`} defaultValue={m.roomPassword} className="bg-[#121212] border border-white/10 rounded p-2 text-sm w-32" />
                <button 
                  onClick={() => {
                    const rid = (document.getElementById(`rid-${m.id}`) as HTMLInputElement).value;
                    const rpwd = (document.getElementById(`rpwd-${m.id}`) as HTMLInputElement).value;
                    adminPublishRoom(m.id, rid, rpwd);
                    alert('Published!');
                  }}
                  className="bg-white text-black px-4 py-2 rounded text-sm font-bold"
                >Save</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpectatorResults({ matches, adminCreditWinnings }: any) {
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  
  const match = matches.find((m: Match) => m.id === selectedMatch);

  return (
    <div className="space-y-6">
      <select value={selectedMatch} onChange={e=>setSelectedMatch(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white">
        <option value="">Select a Match...</option>
        {matches.map((m: Match) => <option key={m.id} value={m.id}>{m.title} ({m.participants.length} Players)</option>)}
      </select>

      {match && (
        <div className="rounded-xl border border-white/10 bg-[#121212] p-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="pb-3 pr-4">Slot</th>
                <th className="pb-3 pr-4">IGN (UID)</th>
                <th className="pb-3 pr-4">Rank (Placement)</th>
                <th className="pb-3 pr-4">Kills</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {match.participants.map((p: any) => (
                <tr key={p.userId} className="border-b border-white/5">
                  <td className="py-3 pr-4">{p.slotNumber}</td>
                  <td className="py-3 pr-4 text-white font-medium">{p.ign} <span className="text-gray-500 text-xs">({p.uid})</span></td>
                  <td className="py-3 pr-4"><input type="number" id={`rank-${p.userId}`} placeholder="1" className="w-16 bg-[#0A0A0A] border border-white/10 rounded p-1 text-center" /></td>
                  <td className="py-3 pr-4"><input type="number" id={`kills-${p.userId}`} placeholder="0" className="w-16 bg-[#0A0A0A] border border-white/10 rounded p-1 text-center" /></td>
                  <td className="py-3">
                    <button 
                      onClick={() => {
                        const rank = Number((document.getElementById(`rank-${p.userId}`) as HTMLInputElement).value);
                        const kills = Number((document.getElementById(`kills-${p.userId}`) as HTMLInputElement).value);
                        const winnings = (kills * match.perKillReward) + (rank === 1 ? match.booyahBonus : 0);
                        if (winnings > 0) {
                          adminCreditWinnings(p.userId, winnings, `Winnings: Match ${match.title} (Rank ${rank}, Kills ${kills})`);
                          alert(`Credited ₹${winnings} to ${p.ign}`);
                        } else {
                          alert(`No winnings calculated (0 kills, no Booyah).`);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold"
                    >Credit Winnings</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PendingDeposits({ transactions, approve, reject }: any) {
  const pending = transactions.filter((t: any) => t.type === 'deposit' && t.status === 'pending');
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Pending Deposits ({pending.length})</h3>
      {pending.map((t: any) => (
        <div key={t.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border border-white/10 bg-[#121212] gap-4">
          <div>
            <p className="font-bold text-green-400">₹{t.amount}</p>
            <p className="text-sm text-gray-400">UTR: <span className="text-white">{t.reference}</span></p>
            <p className="text-xs text-gray-500">User ID: {t.userId} • {new Date(t.timestamp).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { approve(t.id); alert('Approved'); }} className="bg-green-600 hover:bg-green-700 p-2 rounded-lg text-white"><CheckCircle className="h-5 w-5" /></button>
            <button onClick={() => { 
              const reason = prompt('Reason for rejection?'); 
              if(reason) { reject(t.id, reason); alert('Rejected'); } 
            }} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg text-white"><XCircle className="h-5 w-5" /></button>
          </div>
        </div>
      ))}
      {pending.length === 0 && <p className="text-gray-500">No pending deposits.</p>}
    </div>
  );
}

function PendingWithdrawals({ transactions, markPaid }: any) {
  const pending = transactions.filter((t: any) => t.type === 'withdrawal' && t.status === 'pending');
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Pending Withdrawals ({pending.length})</h3>
      {pending.map((t: any) => (
        <div key={t.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border border-white/10 bg-[#121212] gap-4">
          <div>
            <p className="font-bold text-white">₹{t.amount}</p>
            <p className="text-sm text-gray-400">UPI ID: <span className="font-mono text-white">{t.reference}</span></p>
            <p className="text-xs text-gray-500">User ID: {t.userId} • {new Date(t.timestamp).toLocaleString()}</p>
          </div>
          <button onClick={() => { 
            const ref = prompt('Enter Bank Reference/UTR for payment proof:'); 
            if(ref) { markPaid(t.id, ref); alert('Marked as Paid'); } 
          }} className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-bold text-sm">
            Mark Paid
          </button>
        </div>
      ))}
      {pending.length === 0 && <p className="text-gray-500">No pending withdrawals.</p>}
    </div>
  );
}

function UserAudit({ adminPenalty }: any) {
  const [uid, setUid] = useState('');
  const [amt, setAmt] = useState(0);
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminPenalty(uid, amt, reason);
    alert('Penalty/Bonus applied');
    setUid(''); setAmt(0); setReason('');
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] p-6 max-w-xl">
      <h3 className="text-xl font-bold text-white mb-4">User Audit & Penalty Tool</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400">User ID</label>
          <input type="text" required value={uid} onChange={e=>setUid(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded p-2 text-white" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Amount (+ for bonus, - for penalty)</label>
          <input type="number" required value={amt} onChange={e=>setAmt(Number(e.target.value))} className="w-full bg-[#0A0A0A] border border-white/10 rounded p-2 text-white" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Reason (Visible to user)</label>
          <input type="text" required value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Deducted 50 for Teaming" className="w-full bg-[#0A0A0A] border border-white/10 rounded p-2 text-white" />
        </div>
        <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded">Apply Transaction</button>
      </form>
    </div>
  );
}


function UserList({ users }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Registered Users ({users?.length || 0})</h3>
      <div className="rounded-xl border border-white/10 bg-[#121212] overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-400 border-b border-white/10 bg-[#0A0A0A]">
            <tr>
              <th className="p-4">Player</th>
              <th className="p-4">IGN</th>
              <th className="p-4">UID</th>
              <th className="p-4">Wallet</th>
              <th className="p-4">Joined At</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u: any) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                  <span className="font-medium text-white">{u.name}</span>
                </td>
                <td className="p-4 text-gray-300">{u.ign || '-'}</td>
                <td className="p-4 text-gray-300">{u.uid || '-'}</td>
                <td className="p-4 font-mono font-bold text-green-400">₹{u.walletBalance}</td>
                <td className="p-4 text-gray-500">{u.createdAt ? new Date(u.createdAt.toDate?.() || u.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        )}
      </div>
    </div>
  );
}
