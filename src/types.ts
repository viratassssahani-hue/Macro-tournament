export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
export type MatchMode = 'Solo' | 'Duo' | 'Squad';

export interface Participant {
  userId: string;
  ign: string;
  uid: string;
  slotNumber: number;
  teamId?: string;
}

export interface Match {
  id: string;
  title: string;
  map: string;
  mode: MatchMode;
  startTime: string; // ISO string
  entryFee: number;
  perKillReward: number;
  booyahBonus: number;
  totalSeats: number;
  joinedSeats: number;
  status: MatchStatus;
  roomId?: string;
  roomPassword?: string;
  participants: Participant[];
}

export interface User {
  id: string;
  name: string;
  ign: string;
  uid: string;
  phone?: string;
  walletBalance: number;
  avatar: string;
  isAdmin?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'entry_fee' | 'winnings' | 'penalty';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  reference?: string; // UTR, UPI ID, or internal
  timestamp: string;
  reason?: string;
}

export interface LeaderboardEntry {
  userId: string;
  ign: string;
  avatar: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Grandmaster';
  rank?: number;
}
