import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, Copy, CheckCircle2, History } from 'lucide-react';
import { useStore } from '../store';

export default function Wallet() {
  const { currentUser, transactions, requestDeposit, requestWithdrawal } = useStore();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);

  if (!currentUser) return <div className="text-center text-white py-20">Please log in to view wallet.</div>;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > 0 && reference.trim()) {
      try {
        await requestDeposit(Number(amount), reference);
        alert('Deposit request submitted. Waiting for admin approval.');
        setAmount('');
        setReference('');
        setActiveTab('history');
      } catch (err: any) {
        alert(err.message || 'Deposit failed');
      }
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) >= 50 && reference.trim()) {
      try {
        await requestWithdrawal(Number(amount), reference);
        alert('Withdrawal request submitted.');
        setAmount('');
        setReference('');
        setActiveTab('history');
      } catch (err: any) {
        alert(err.message || 'Withdrawal failed');
      }
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText('8976561603@fam');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const myTransactions = transactions.filter(t => t.userId === currentUser.id);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Wallet Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0A0A0A] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 opacity-5">
          <WalletIcon className="h-64 w-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Available Balance</p>
            <h2 className="text-5xl font-bold text-white tracking-tighter">₹{currentUser.walletBalance.toFixed(2)}</h2>
          </div>
          <div className="flex bg-[#121212] border border-white/10 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'deposit' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <ArrowDownToLine className="h-4 w-4" /> Deposit
            </button>
            <button 
              onClick={() => setActiveTab('withdraw')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'withdraw' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <ArrowUpFromLine className="h-4 w-4" /> Withdraw
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <History className="h-4 w-4" /> History
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border border-white/10 bg-[#121212] p-8"
      >
        {activeTab === 'deposit' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-bold text-white">Add Funds via UPI</h3>
                <p className="text-sm text-gray-400">1. Pay the desired amount to the UPI ID below.</p>
                
                <div className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-[#0A0A0A]">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Official UPI ID</p>
                    <p className="font-mono text-lg text-white">8976561603@fam</p>
                  </div>
                  <button onClick={copyUpi} className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors">
                    {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                
                <p className="text-sm text-gray-400 mt-4">2. Enter the amount and the 12-digit UTR/Reference number below to claim it.</p>
              </div>
              
              <div className="w-40 h-40 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shrink-0">
                 <div className="text-center text-gray-500 text-sm">QR<br/>Placeholder</div>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">12-Digit UTR No.</label>
                  <input
                    type="text"
                    required
                    pattern="\d{12}"
                    title="Must be a 12-digit number"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 301234567890"
                    className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-gray-200 uppercase tracking-wider"
              >
                Submit Deposit Request
              </button>
            </form>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Withdraw Winnings</h3>
              <p className="text-sm text-gray-400">Funds are transferred to your UPI ID within 24 hours. Minimum withdrawal is ₹50.</p>
            </div>

            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  min="50"
                  max={currentUser.walletBalance}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Max: ${currentUser.walletBalance}`}
                  className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400 uppercase tracking-wider">Your UPI ID</label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. number@paytm"
                  className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-white px-4 py-3 font-bold text-black transition-colors hover:bg-gray-200 uppercase tracking-wider"
              >
                Request Withdrawal
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
            {myTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions found.</p>
            ) : (
              <div className="space-y-3">
                {myTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-[#0A0A0A]">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        ['deposit', 'winnings'].includes(tx.type) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {['deposit', 'winnings'].includes(tx.type) ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white capitalize">{tx.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()} • {tx.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        ['deposit', 'winnings'].includes(tx.type) ? 'text-green-500' : 'text-white'
                      }`}>
                        {['deposit', 'winnings'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                      </p>
                      {tx.reason && <p className="text-xs text-gray-500 max-w-[150px] truncate">{tx.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
