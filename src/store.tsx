import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Match, Transaction, LeaderboardEntry } from './types';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  updateDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';

interface StoreState {
  currentUser: User | null;
  isAdminAuthenticated: boolean;
  matches: Match[];
  transactions: Transaction[];
  leaderboard: LeaderboardEntry[];
  loginUser: () => Promise<void>;
  logoutUser: () => void;
  updateUserProfile: (ign: string, uid: string, phone: string) => Promise<void>;
  loginAdmin: (id: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  joinMatch: (matchId: string, participants: {ign: string, uid: string}[], entryFee: number) => Promise<boolean>;
  requestDeposit: (amount: number, utr: string) => Promise<boolean>;
  requestWithdrawal: (amount: number, upiId: string) => Promise<boolean>;
  adminApproveDeposit: (transactionId: string, userId: string, amount: number) => Promise<void>;
  adminRejectDeposit: (transactionId: string, reason: string) => Promise<void>;
  adminMarkPaid: (transactionId: string, ref: string) => Promise<void>;
  adminPenalty: (userId: string, amount: number, reason: string) => Promise<void>;
  adminPublishRoom: (matchId: string, roomId: string, password: string) => Promise<void>;
  adminCreditWinnings: (userId: string, amount: number, reason: string) => Promise<void>;
  adminCreateMatch: (match: Omit<Match, 'id' | 'status' | 'joinedSeats' | 'participants'>) => Promise<void>;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    sessionStorage.getItem('isAdminAuthenticated') === 'true'
  );
  const [matches, setMatches] = useState<Match[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user from Firestore
        const userDoc = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDoc, (snapshot) => {
          if (snapshot.exists()) {
            setCurrentUser({ id: snapshot.id, ...snapshot.data() } as User);
          } else {
            // Create user
            const newUser: User = {
              id: user.uid,
              name: user.displayName || 'New Player',
              ign: '',
              uid: '',
              walletBalance: 0,
              avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
            };
            setDoc(userDoc, {
              name: newUser.name,
              ign: newUser.ign,
              uid: newUser.uid,
              walletBalance: newUser.walletBalance,
              avatar: newUser.avatar,
              isAdmin: false,
              createdAt: serverTimestamp()
            });
          }
        });
        return () => unsubscribeUser();
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to matches
  useEffect(() => {
    const unsubscribeMatches = onSnapshot(collection(db, 'matches'), async (snapshot) => {
      const loadedMatches = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const matchData = docSnap.data();
        
        // Fetch participants for this match
        const participantsSnap = await getDocs(collection(db, 'matches', docSnap.id, 'participants'));
        const participants = participantsSnap.docs.map(pDoc => pDoc.data());

        return {
          id: docSnap.id,
          title: matchData.title,
          map: matchData.map,
          mode: matchData.mode,
          startTime: matchData.startTime,
          entryFee: matchData.entryFee,
          perKillReward: matchData.perKillReward,
          booyahBonus: matchData.booyahBonus,
          totalSeats: matchData.totalSeats,
          joinedSeats: matchData.joinedSeats,
          status: matchData.status,
          roomId: matchData.roomId,
          roomPassword: matchData.roomPassword,
          participants: participants
        } as Match;
      }));
      setMatches(loadedMatches);
    });
    return () => unsubscribeMatches();
  }, []);

  // Listen to transactions
  useEffect(() => {
    // Wait for currentUser to be initialized before querying transactions
    if (!currentUser) {
      setTransactions([]);
      return;
    }

    let q = query(collection(db, 'transactions'));
    if (!currentUser.isAdmin) {
      q = query(collection(db, 'transactions'), where('userId', '==', currentUser.id));
    }

    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const loadedTxs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      // sort client side
      loadedTxs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTransactions(loadedTxs);
    });
    return () => unsubscribeTransactions();
  }, [currentUser?.id, currentUser?.isAdmin]);

  const loginUser = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (e) {
      console.error(e);
    }
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (ign: string, uid: string, phone: string) => {
    if (currentUser) {
      await updateDoc(doc(db, 'users', currentUser.id), { ign, uid, phone });
    }
  };

  const loginAdmin = async (id: string, pass: string) => {
    if (id === 'adminvirat' && pass === 'adminvirataregod') {
      if (!currentUser) return false;
      try {
        await updateDoc(doc(db, 'users', currentUser.id), { isAdmin: true });
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('isAdminAuthenticated');
  };

  const joinMatch = async (matchId: string, participantInputs: {ign: string, uid: string}[], entryFee: number) => {
    if (!currentUser) return false;
    if (currentUser.walletBalance < entryFee) return false;

    try {
      const matchDoc = doc(db, 'matches', matchId);
      const matchSnap = await getDoc(matchDoc);
      const joinedSeats = matchSnap.data()?.joinedSeats || 0;

      // Ideally this would be a batch/transaction, simulating for simplicity given rules structure
      await updateDoc(doc(db, 'users', currentUser.id), {
        walletBalance: currentUser.walletBalance - entryFee
      });

      const txId = `t${Date.now()}`;
      await setDoc(doc(db, 'transactions', txId), {
        userId: currentUser.id,
        type: 'entry_fee',
        amount: entryFee,
        status: 'approved',
        timestamp: new Date().toISOString(),
        reason: `Entry fee for Match`
      });

      await updateDoc(matchDoc, {
        joinedSeats: joinedSeats + participantInputs.length
      });

      for (let i = 0; i < participantInputs.length; i++) {
        const p = participantInputs[i];
        const participantId = i === 0 ? currentUser.id : `mock-${p.uid}`;
        await setDoc(doc(db, 'matches', matchId, 'participants', participantId), {
          userId: i === 0 ? currentUser.id : participantId,
          ign: p.ign,
          uid: p.uid,
          slotNumber: joinedSeats + i + 1,
          createdAt: serverTimestamp()
        });
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const requestDeposit = async (amount: number, utr: string) => {
    if (!currentUser) return false;
    
    try {
      const txId = `t${Date.now()}`;
      await setDoc(doc(db, 'transactions', txId), {
        userId: currentUser.id,
        type: 'deposit',
        amount,
        status: 'pending',
        reference: utr,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const requestWithdrawal = async (amount: number, upiId: string) => {
    if (!currentUser || currentUser.walletBalance < amount) return false;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        walletBalance: currentUser.walletBalance - amount
      });

      const txId = `t${Date.now()}`;
      await setDoc(doc(db, 'transactions', txId), {
        userId: currentUser.id,
        type: 'withdrawal',
        amount,
        status: 'pending',
        reference: upiId,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const adminApproveDeposit = async (transactionId: string, userId: string, amount: number) => {
    if (!isAdminAuthenticated) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const currentBalance = userDoc.data()?.walletBalance || 0;
      
      await updateDoc(doc(db, 'users', userId), {
        walletBalance: currentBalance + amount
      });
      
      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'approved'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const adminRejectDeposit = async (transactionId: string, reason: string) => {
    if (!isAdminAuthenticated) return;
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'rejected',
        reason
      });
    } catch (e) {
      console.error(e);
    }
  };

  const adminMarkPaid = async (transactionId: string, ref: string) => {
    if (!isAdminAuthenticated) return;
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'paid',
        reference: ref
      });
    } catch (e) {
      console.error(e);
    }
  };

  const adminPenalty = async (userId: string, amount: number, reason: string) => {
    if (!isAdminAuthenticated) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const currentBalance = userDoc.data()?.walletBalance || 0;
      
      await updateDoc(doc(db, 'users', userId), {
        walletBalance: currentBalance + amount // Note: amount might be negative
      });

      const txId = `t${Date.now()}`;
      await setDoc(doc(db, 'transactions', txId), {
        userId,
        type: 'penalty',
        amount,
        status: 'approved',
        timestamp: new Date().toISOString(),
        reason
      });
    } catch (e) {
      console.error(e);
    }
  };

  const adminPublishRoom = async (matchId: string, roomId: string, password: string) => {
    if (!isAdminAuthenticated) return;
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        roomId,
        roomPassword: password
      });
    } catch (e) {
      console.error(e);
    }
  };

  const adminCreditWinnings = async (userId: string, amount: number, reason: string) => {
    if (!isAdminAuthenticated) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const currentBalance = userDoc.data()?.walletBalance || 0;
      
      await updateDoc(doc(db, 'users', userId), {
        walletBalance: currentBalance + amount
      });

      const txId = `t${Date.now()}`;
      await setDoc(doc(db, 'transactions', txId), {
        userId,
        type: 'winnings',
        amount,
        status: 'approved',
        timestamp: new Date().toISOString(),
        reason
      });
    } catch (e) {
      console.error(e);
    }
  };

  const adminCreateMatch = async (matchData: Omit<Match, 'id' | 'status' | 'joinedSeats' | 'participants'>) => {
    if (!isAdminAuthenticated) return;
    try {
      const matchId = `m${Date.now()}`;
      await setDoc(doc(db, 'matches', matchId), {
        title: matchData.title,
        map: matchData.map,
        mode: matchData.mode,
        startTime: matchData.startTime,
        entryFee: matchData.entryFee,
        perKillReward: matchData.perKillReward,
        booyahBonus: matchData.booyahBonus,
        totalSeats: matchData.totalSeats,
        joinedSeats: 0,
        status: 'upcoming',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <StoreContext.Provider value={{
      currentUser, isAdminAuthenticated, matches, transactions, leaderboard,
      loginUser, logoutUser, updateUserProfile, loginAdmin, logoutAdmin, joinMatch,
      requestDeposit, requestWithdrawal, adminApproveDeposit, adminRejectDeposit,
      adminMarkPaid, adminPenalty, adminPublishRoom, adminCreditWinnings, adminCreateMatch
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
