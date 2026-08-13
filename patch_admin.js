const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

// 1. Add "users" to the hook destructuring
code = code.replace(
  /const { \n    isAdminAuthenticated, logoutAdmin, matches, transactions, \n    adminCreateMatch, adminPublishRoom, adminCreditWinnings,\n    adminApproveDeposit, adminRejectDeposit, adminMarkPaid, adminPenalty\n  } = useStore\(\);/s,
  `const { 
    isAdminAuthenticated, logoutAdmin, matches, transactions, users,
    adminCreateMatch, adminPublishRoom, adminCreditWinnings,
    adminApproveDeposit, adminRejectDeposit, adminMarkPaid, adminPenalty,
    adminDeleteMatch, adminUpdateMatchStatus
  } = useStore();`
);

// 2. Add 'users' to activeTab state
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'matches' \| 'results' \| 'deposits' \| 'withdrawals' \| 'audit'>\('matches'\);/,
  `const [activeTab, setActiveTab] = useState<'matches' | 'results' | 'deposits' | 'withdrawals' | 'audit' | 'users'>('matches');`
);

// 3. Add Users tab button
code = code.replace(
  /<button\n              onClick=\{const handleTab = \(\) => setActiveTab\('audit'\);/, // This is wrong, let's find the nav items
  ``
);

// Find nav items
const navReplacement = `
          {['matches', 'results', 'deposits', 'withdrawals', 'audit', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={\`px-4 py-4 text-sm font-medium uppercase tracking-wider whitespace-nowrap \${
                activeTab === tab 
                  ? 'text-red-500 border-b-2 border-red-500' 
                  : 'text-gray-400 hover:text-white'
              }\`}
            >
              {tab}
            </button>
          ))}
`;

// wait, the nav items might be hardcoded. Let's look for activeTab === 'audit'
