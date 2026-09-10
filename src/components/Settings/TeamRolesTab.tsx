import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Trash2, 
  Edit3,
  X,
  BadgeAlert
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

export interface TeamMember {
  id: string;
  name: string;
  role: 'Owner & CFO' | 'Managing Director' | 'Yard Supervisor' | 'Parts Specialist' | 'Sales Cashier';
  accessLevel: 'Administrator' | 'Stores Master' | 'Sales Cashier' | 'Field Technician';
  email: string;
  phone: string;
  status: 'Active' | 'On Shift' | 'On Leave';
  avatarInitials: string;
  avatarBg: string;
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'CPA Hassan Bukenya',
    role: 'Owner & CFO',
    accessLevel: 'Administrator',
    email: 'hassan@karat.co.ug',
    phone: '+256 700 882194',
    status: 'Active',
    avatarInitials: 'HB',
    avatarBg: 'bg-[#111111] text-[#F6AF31]'
  },
  {
    id: 'usr-2',
    name: 'Eng. Ronald Mukasa, PE',
    role: 'Managing Director',
    accessLevel: 'Administrator',
    email: 'r.mukasa@karat.co.ug',
    phone: '+256 772 491022',
    status: 'Active',
    avatarInitials: 'RM',
    avatarBg: 'bg-blue-600 text-white'
  },
  {
    id: 'usr-3',
    name: 'Hassan Ssewankambo',
    role: 'Yard Supervisor',
    accessLevel: 'Stores Master',
    email: 'yard4@karat.co.ug',
    phone: '+256 751 339014',
    status: 'On Shift',
    avatarInitials: 'HS',
    avatarBg: 'bg-emerald-700 text-white'
  },
  {
    id: 'usr-4',
    name: 'Alex Mugisha',
    role: 'Parts Specialist',
    accessLevel: 'Field Technician',
    email: 'alex.parts@karat.co.ug',
    phone: '+256 788 123490',
    status: 'On Shift',
    avatarInitials: 'AM',
    avatarBg: 'bg-amber-600 text-white'
  },
  {
    id: 'usr-5',
    name: 'Grace Akello',
    role: 'Sales Cashier',
    accessLevel: 'Sales Cashier',
    email: 'cashier1@karat.co.ug',
    phone: '+256 702 994012',
    status: 'Active',
    avatarInitials: 'GA',
    avatarBg: 'bg-purple-600 text-white'
  }
];

export const TeamRolesTab: React.FC = () => {
  const { setFlashMessage } = useInertia();

  const [team, setTeam] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('karat_team_members');
      return saved ? JSON.parse(saved) : INITIAL_TEAM;
    } catch {
      return INITIAL_TEAM;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Parts Specialist' as TeamMember['role'],
    accessLevel: 'Field Technician' as TeamMember['accessLevel'],
    email: '',
    phone: ''
  });

  const saveTeam = (updated: TeamMember[]) => {
    setTeam(updated);
    try {
      localStorage.setItem('karat_team_members', JSON.stringify(updated));
    } catch {}
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      setFlashMessage('error', 'Please enter a name and email for the team member.');
      return;
    }

    const initials = newMember.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const created: TeamMember = {
      id: `usr-${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      accessLevel: newMember.accessLevel,
      email: newMember.email,
      phone: newMember.phone || '+256 700 000000',
      status: 'Active',
      avatarInitials: initials || 'ST',
      avatarBg: 'bg-slate-800 text-white'
    };

    const next = [created, ...team];
    saveTeam(next);
    setIsModalOpen(false);
    setNewMember({
      name: '',
      role: 'Parts Specialist',
      accessLevel: 'Field Technician',
      email: '',
      phone: ''
    });
    setFlashMessage('success', `${created.name} added to KARAT Operations team.`);
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (id === 'usr-1' || id === 'usr-2') {
      setFlashMessage('error', 'Principal Directors & CFO accounts cannot be deleted.');
      return;
    }
    const next = team.filter(m => m.id !== id);
    saveTeam(next);
    setFlashMessage('info', `${name} removed from active team.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Team Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F6AF31] bg-[#111111] px-2 py-0.5 rounded-md">
              Access Control
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Store Staff & Permission Access Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Manage authorized operators across Yard 4 receiving bays, sales register, and finance management.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-[#F6AF31] text-xs font-black rounded-2xl flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>

        {/* Team Members List */}
        <div className="divide-y divide-slate-100">
          {team.map(member => (
            <div key={member.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${member.avatarBg}`}>
                  {member.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#111111]">{member.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {member.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {member.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {member.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  member.accessLevel === 'Administrator'
                    ? 'bg-purple-100 text-purple-800'
                    : member.accessLevel === 'Stores Master'
                    ? 'bg-emerald-100 text-emerald-800'
                    : member.accessLevel === 'Sales Cashier'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {member.accessLevel}
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  member.status === 'Active'
                    ? 'bg-emerald-50 text-[#22A06B] border border-emerald-200'
                    : member.status === 'On Shift'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {member.status}
                </span>

                {member.id !== 'usr-1' && member.id !== 'usr-2' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Guide Card */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-5 text-xs text-slate-600 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
          Role Hierarchy Reference
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-2xl border border-slate-200">
            <span className="font-bold text-[#111111] block">Administrator</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Full control over inventory catalog, FX exchange rate pegs, OEM restock orders, and settings.
            </p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200">
            <span className="font-bold text-[#111111] block">Stores Master</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Yard 4 stock receiving, shelf bin reassignment, damaged part logging, and restock creation.
            </p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200">
            <span className="font-bold text-[#111111] block">Sales Cashier</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Point-of-sale register, receipt printing, counter sales, and payment verification.
            </p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200">
            <span className="font-bold text-[#111111] block">Field Technician</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Catalog search, parts compatibility lookup, excavator cross-referencing, and read-only orders.
            </p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#111111]">
                  Add Authorized Operator
                </h3>
                <p className="text-[11px] text-slate-500">
                  Provision new credentials for Yard 4 depot or counter sales.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dennis Okello, Parts Officer"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Assigned Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#111111]"
                  >
                    <option value="Parts Specialist">Parts Specialist</option>
                    <option value="Yard Supervisor">Yard Supervisor</option>
                    <option value="Sales Cashier">Sales Cashier</option>
                    <option value="Managing Director">Managing Director</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Access Level
                  </label>
                  <select
                    value={newMember.accessLevel}
                    onChange={e => setNewMember({ ...newMember, accessLevel: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#111111]"
                  >
                    <option value="Field Technician">Field Technician</option>
                    <option value="Sales Cashier">Sales Cashier</option>
                    <option value="Stores Master">Stores Master</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="name@karat.co.ug"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Phone Contact
                </label>
                <input
                  type="text"
                  placeholder="+256 700 000000"
                  value={newMember.phone}
                  onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-black rounded-xl cursor-pointer"
                >
                  Authorize Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
