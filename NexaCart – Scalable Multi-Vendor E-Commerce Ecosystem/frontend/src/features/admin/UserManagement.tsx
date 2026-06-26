import React, { useState } from 'react';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';

interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([
    { id: 1, firstName: 'Haripad', lastName: 'Patar', email: 'haripad@example.com', role: 'ROLE_ADMIN', active: true },
    { id: 2, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ROLE_VENDOR', active: true },
    { id: 3, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', role: 'ROLE_CUSTOMER', active: true },
    { id: 4, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', role: 'ROLE_CUSTOMER', active: false },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleActive = (id: number) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">User Access Controls</h2>
        <p className="text-slate-500 text-xs mt-0.5">Audit system user profiles and toggle suspended credentials</p>
      </div>

      <div className="flex max-w-md relative">
        <input
          type="text"
          placeholder="Filter user by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0e1423] text-sm text-slate-355 pl-4 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
        />
        <Search size={16} className="absolute right-3.5 top-3.5 text-slate-500" />
      </div>

      <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-400 text-left">
            <thead className="bg-[#0c1222] border-b border-slate-800 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Role Authority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-850 hover:bg-slate-900/20 last:border-0">
                  <td className="px-6 py-4 font-bold text-white">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-900/40">
                      {u.role.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        u.active
                          ? 'bg-green-950 text-green-400 border border-green-900'
                          : 'bg-red-950 text-red-400 border border-red-900'
                      }`}
                    >
                      {u.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'ROLE_ADMIN' && (
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1 ${
                          u.active
                            ? 'text-red-450 hover:bg-red-950/20'
                            : 'text-green-450 hover:bg-green-950/20'
                        }`}
                      >
                        {u.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
