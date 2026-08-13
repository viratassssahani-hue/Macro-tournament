const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

// Update destructuring
code = code.replace(
  /const { \n    isAdminAuthenticated, logoutAdmin, matches, transactions, \n    adminCreateMatch, adminPublishRoom, adminCreditWinnings,\n    adminApproveDeposit, adminRejectDeposit, adminMarkPaid, adminPenalty\n  } = useStore\(\);/s,
  `const { 
    isAdminAuthenticated, logoutAdmin, matches, transactions, leaderboard, users,
    adminCreateMatch, adminPublishRoom, adminCreditWinnings,
    adminApproveDeposit, adminRejectDeposit, adminMarkPaid, adminPenalty,
    adminDeleteMatch, adminUpdateMatchStatus
  } = useStore();`
);

// Update activeTab type
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'matches' \| 'results' \| 'deposits' \| 'withdrawals' \| 'audit'>\('matches'\);/,
  `const [activeTab, setActiveTab] = useState<'matches' | 'results' | 'deposits' | 'withdrawals' | 'audit' | 'users'>('matches');`
);

// Update tabs array
code = code.replace(
  /\(\['matches', 'results', 'deposits', 'withdrawals', 'audit'\] as const\)/,
  `(['matches', 'results', 'deposits', 'withdrawals', 'audit', 'users'] as const)`
);

// Update routing
code = code.replace(
  /\{activeTab === 'audit' && <UserAudit adminPenalty=\{adminPenalty\} \/>\}/,
  `{activeTab === 'audit' && <UserAudit adminPenalty={adminPenalty} />}\n          {activeTab === 'users' && <UserList users={users} />}`
);

// Add users prop to MatchCreator
code = code.replace(
  /adminCreateMatch=\{adminCreateMatch\} matches=\{matches\} adminPublishRoom=\{adminPublishRoom\}/,
  `adminCreateMatch={adminCreateMatch} matches={matches} adminPublishRoom={adminPublishRoom} adminDeleteMatch={adminDeleteMatch} adminUpdateMatchStatus={adminUpdateMatchStatus}`
);

// Update MatchCreator signature
code = code.replace(
  /function MatchCreator\(\{ adminCreateMatch, matches, adminPublishRoom \}: any\) \{/,
  `function MatchCreator({ adminCreateMatch, matches, adminPublishRoom, adminDeleteMatch, adminUpdateMatchStatus }: any) {`
);

// Add pause / delete buttons to MatchCreator cards
const matchCardButtons = `
              <div className="flex gap-2">
                <input type="text" placeholder="Room ID" id={\`rid-\${m.id}\`} defaultValue={m.roomId} className="bg-[#121212] border border-white/10 rounded p-2 text-sm w-32" />
                <input type="text" placeholder="Password" id={\`rpwd-\${m.id}\`} defaultValue={m.roomPassword} className="bg-[#121212] border border-white/10 rounded p-2 text-sm w-32" />
                <button 
                  onClick={() => {
                    const rid = (document.getElementById(\`rid-\${m.id}\`) as HTMLInputElement).value;
                    const rpwd = (document.getElementById(\`rpwd-\${m.id}\`) as HTMLInputElement).value;
                    adminPublishRoom(m.id, rid, rpwd);
                    alert('Published!');
                  }}
                  className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded text-sm font-bold"
                >Save</button>
                {m.status !== 'cancelled' && (
                  <button 
                    onClick={() => {
                      if(window.confirm('Pause/Cancel this match?')) {
                        adminUpdateMatchStatus(m.id, 'cancelled');
                      }
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-bold"
                  >Pause</button>
                )}
                <button 
                  onClick={() => {
                    if(window.confirm('Are you sure you want to delete this match entirely?')) {
                      adminDeleteMatch(m.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center justify-center"
                >Delete</button>
              </div>
`;

code = code.replace(
  /<div className="flex gap-2">\s*<input type="text" placeholder="Room ID" id=\{`rid-\$\{m\.id\}`\} defaultValue=\{m\.roomId\} className="bg-\[#121212\] border border-white\/10 rounded p-2 text-sm w-32" \/>\s*<input type="text" placeholder="Password" id=\{`rpwd-\$\{m\.id\}`\} defaultValue=\{m\.roomPassword\} className="bg-\[#121212\] border border-white\/10 rounded p-2 text-sm w-32" \/>\s*<button \s*onClick=\{\(\) => \{\s*const rid = \(document\.getElementById\(`rid-\$\{m\.id\}`\) as HTMLInputElement\)\.value;\s*const rpwd = \(document\.getElementById\(`rpwd-\$\{m\.id\}`\) as HTMLInputElement\)\.value;\s*adminPublishRoom\(m\.id, rid, rpwd\);\s*alert\('Published!'\);\s*\}\}\s*className="bg-white text-black px-4 py-2 rounded text-sm font-bold"\s*>Save<\/button>\s*<\/div>/,
  matchCardButtons
);

// Add UserList component at the end
const userListComp = `

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
`;

code += userListComp;

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx");
