import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, FileText, ChevronDown, ShieldAlert, CreditCard, Clock } from 'lucide-react';

const faqs = [
  {
    icon: CreditCard,
    q: 'How do I add funds to my wallet?',
    a: 'Go to the Wallet section, transfer the desired amount to the official Admin UPI ID (8976561603@fam), and submit the 12-digit UTR/Reference number. The admin will verify and credit your wallet shortly.'
  },
  {
    icon: Clock,
    q: 'When will I get the Room ID and Password?',
    a: 'Room credentials will automatically appear on the Match Details page exactly 10 minutes before the scheduled match start time.'
  },
  {
    icon: ShieldAlert,
    q: 'What are the rules regarding hacking or teaming?',
    a: 'Zero tolerance. Any player found using hacks, exploiting bugs, or teaming up in Solo/Duo matches will be permanently banned and their wallet balance will be forfeited. No refunds.'
  }
];

export default function Help() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Support & Rules</h1>
        <p className="text-gray-400">Everything you need to know about playing on Esports Arena.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a 
          href="https://wa.me/918976561603?text=Hi%2C%20I%20need%20help%20with%20Esports%20Arena" 
          target="_blank" rel="noreferrer"
          className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 flex flex-col items-center justify-center text-center hover:bg-green-500/20 transition-colors"
        >
          <MessageCircle className="h-10 w-10 text-green-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">WhatsApp Support</h3>
          <p className="text-sm text-green-400">Click to chat directly with our admins for instant help.</p>
        </a>

        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 flex flex-col items-center justify-center text-center">
          <FileText className="h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Tournament Rules</h3>
          <p className="text-sm text-gray-400">Ensure your in-game name matches exactly. No emulators allowed unless specified.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-[#121212] overflow-hidden">
            <button 
              className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center gap-3">
                <faq.icon className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-white">{faq.q}</span>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 pt-2 border-t border-white/5"
                >
                  <p className="text-sm text-gray-400 pl-8">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
