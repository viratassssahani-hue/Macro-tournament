const fs = require('fs');
let code = fs.readFileSync('src/store.tsx', 'utf-8');

// 1. Add users and new methods to StoreState
code = code.replace(
  /transactions: Transaction\[\];/,
  `transactions: Transaction[];\n  users: User[];\n  adminDeleteMatch: (matchId: string) => Promise<void>;\n  adminUpdateMatchStatus: (matchId: string, status: MatchStatus) => Promise<void>;`
);

// 2. Add users state
code = code.replace(
  /const \[transactions, setTransactions\] = useState<Transaction\[\]>\(\[\]\);/,
  `const [transactions, setTransactions] = useState<Transaction[]>([]);\n  const [users, setUsers] = useState<User[]>([]);`
);

// 3. Add useEffect to listen to users if isAdmin
const usersEffect = `
  useEffect(() => {
    if (!isAdminAuthenticated) {
      setUsers([]);
      return;
    }
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const loadedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(loadedUsers);
    });
    return () => unsubscribeUsers();
  }, [isAdminAuthenticated]);
`;

code = code.replace(
  /  \/\/ Listen to matches/,
  usersEffect + '\n  // Listen to matches'
);

// 4. Add the methods
const methods = `
  const adminDeleteMatch = async (matchId: string) => {
    if (!isAdminAuthenticated) return;
    try {
      // Need to delete participants collection first if there are any, but relying on cascade or ignoring
      await deleteDoc(doc(db, 'matches', matchId));
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  const adminUpdateMatchStatus = async (matchId: string, status: MatchStatus) => {
    if (!isAdminAuthenticated) return;
    try {
      await updateDoc(doc(db, 'matches', matchId), { status });
    } catch (error) {
      console.error("Error updating match status:", error);
    }
  };
`;

code = code.replace(
  /  const adminCreateMatch = async /,
  methods + '\n  const adminCreateMatch = async '
);

// 5. Add to return value
code = code.replace(
  /adminCreateMatch\n      \}\}>/,
  `adminCreateMatch,\n        users,\n        adminDeleteMatch,\n        adminUpdateMatchStatus\n      }}>`
);

// Add deleteDoc to imports if missing
if (!code.includes('deleteDoc')) {
  code = code.replace(/getDocs\n\} from 'firebase\/firestore';/, "getDocs,\n  deleteDoc\n} from 'firebase/firestore';");
}

fs.writeFileSync('src/store.tsx', code);
console.log("Patched store.tsx");
