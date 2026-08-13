import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wallet, Trophy, HelpCircle, Menu, X, User, Download } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils';

export default function Layout() {
  const { currentUser } = useStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Help & Rules', path: '/help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white/20">
      {/* Floating Glass Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0A0A]/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-white">ESPORTS ARENA</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-white",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Status */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <Link to="/wallet" className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 transition hover:bg-white/10">
                  <Wallet className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">₹{currentUser.walletBalance.toFixed(2)}</span>
                </Link>
                <Link to="/profile" className="h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/10 hover:border-white/50 transition">
                  <img src={currentUser.avatar} alt="Avatar" className="h-full w-full object-cover" />
                </Link>
              </>
            ) : (
              <Link to="/login" className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-gray-200">
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#121212] shadow-2xl"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <span className="text-lg font-bold tracking-wider">MENU</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-2 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      location.pathname === item.path ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                {currentUser && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      location.pathname === '/profile' ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <User className="h-5 w-5" />
                    My Profile
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showPwaBanner && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#121212]/95 backdrop-blur-md p-4 sm:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold">EA</div>
                <div>
                  <p className="text-sm font-bold text-white">Esports Arena</p>
                  <p className="text-xs text-gray-400">Add to Home Screen</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowPwaBanner(false)}
                  className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black flex items-center gap-1"
                >
                  <Download className="h-3 w-3" /> Install
                </button>
                <button onClick={() => setShowPwaBanner(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
