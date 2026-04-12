import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import toast from 'react-hot-toast';
import SkeletonBlock from '../components/SkeletonBlock';

interface WhitelistEntry {
  id: string;
  email: string;
  category: 'SUPER30' | 'SCHOOL';
  isActive: boolean;
  createdAt: string;
}

interface RecruiterEntry {
  id: string;
  email: string;
  createdAt: string;
  recruiterAccount?: {
    companyName: string;
    website?: string | null;
  } | null;
}

interface DeletedMemberEntry {
  id: string;
  kind: 'WHITELIST' | 'RECRUITER';
  deletedEmail: string;
  deletedName?: string | null;
  deletedUsername?: string | null;
  deletedCategory?: 'SUPER30' | 'SCHOOL' | null;
  deletedCompanyName?: string | null;
  deletedWebsite?: string | null;
  deletedByEmail: string;
  deletedAt: string;
}

export default function AdminDash() {
  const [stats, setStats] = useState({ totalMembers: 0, whitelistCount: 0, recruiterCount: 0, pendingProfiles: 0 });
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterEntry[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<DeletedMemberEntry[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'whitelist' | 'builders' | 'pending' | 'recruiters' | 'deleted'>('whitelist');

  // Derived lists
  const activeBuilders = users.filter(u => u.profile?.isComplete);
  const pendingBuilders = users.filter(u => u.role === 'MEMBER' && (!u.profile || !u.profile.isComplete));

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [newCategory, setNewCategory] = useState<'SUPER30' | 'SCHOOL'>('SCHOOL');

  const statCards = [
    {
      label: 'Whitelist Roster',
      val: stats.whitelistCount,
      icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-1.196-12.308c1.945-2.091 3.3-4.656 3.949-7.263 0 0 .15.92.15 1.87h1.033l.25 1.15H15l.25 1.15h1.033l.25 1.15H18l.25 1.15h1.033l.25 1.15H21',
      accentClass: 'bg-primary shadow-[0_0_24px_rgba(126,214,255,0.25)]',
      iconClass: 'text-primary/70',
      glowClass: 'bg-primary/10',
      shellClass: 'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_90%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_48%,transparent)_100%)]',
    },
    {
      label: 'Verified Builders',
      val: stats.totalMembers,
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      accentClass: 'bg-stone-200/90 shadow-[0_0_20px_rgba(245,241,232,0.12)]',
      iconClass: 'text-stone-200/45',
      glowClass: 'bg-stone-200/5',
      shellClass: 'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_94%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_34%,transparent)_100%)]',
    },
    {
      label: 'Pending Nodes',
      val: stats.pendingProfiles,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      accentClass: 'bg-amber-300/85 shadow-[0_0_18px_rgba(252,211,77,0.14)]',
      iconClass: 'text-amber-300/45',
      glowClass: 'bg-amber-300/5',
      shellClass: 'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_94%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_34%,transparent)_100%)]',
    },
    {
      label: 'Active Recruiters',
      val: stats.recruiterCount,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      accentClass: 'bg-sky-200/75 shadow-[0_0_18px_rgba(186,230,253,0.12)]',
      iconClass: 'text-sky-200/40',
      glowClass: 'bg-sky-200/5',
      shellClass: 'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_94%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_34%,transparent)_100%)]',
    }
  ];

  const fetchData = async () => {
    try {
      const [statsRes, listRes, recruitersRes, usersRes, deletedRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/whitelist'),
        api.get('/admin/recruiters'),
        api.get('/admin/users'),
        api.get('/admin/deleted-members'),
      ]);
      setStats(statsRes.data);
      setWhitelist(listRes.data.emails);
      setRecruiters(recruitersRes.data.recruiters);
      setUsers(usersRes.data.users);
      setDeletedMembers(deletedRes.data.deletedMembers);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      await api.post('/admin/whitelist', { email: newEmail, category: newCategory });
      toast.success('Email added to whitelist');
      setNewEmail('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add email');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.patch(`/admin/whitelist/${id}/toggle`);
      const updatedEntry = res.data?.entry as WhitelistEntry | undefined;
      setWhitelist(prev => prev.map(entry => entry.id === id ? (updatedEntry ?? { ...entry, isActive: !entry.isActive }) : entry));
      toast.success(updatedEntry?.isActive ? 'Entry restored to Explore' : 'Entry paused from Explore');
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this whitelist entry permanently? This hides the builder from Explore, removes the whitelist record, and moves the action to Deleted.')) return;
    try {
      const res = await api.delete(`/admin/whitelist/${id}`);
      setWhitelist(prev => prev.filter(entry => entry.id !== id));
      if (res.data?.deletedMember) {
        setDeletedMembers(prev => [res.data.deletedMember, ...prev]);
      }
      toast.success('Removed from whitelist and moved to Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteRecruiter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recruiter account?')) return;
    try {
      const res = await api.delete(`/admin/recruiters/${id}`);
      setRecruiters(prev => prev.filter(entry => entry.id !== id));
      if (res.data?.deletedMember) {
        setDeletedMembers(prev => [res.data.deletedMember, ...prev]);
      }
      setStats(prev => ({
        ...prev,
        recruiterCount: Math.max(0, prev.recruiterCount - 1),
      }));
      toast.success('Recruiter deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete recruiter');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const entries = lines.map(line => {
          const [email, category] = line.split(',');
          return {
            email: email?.trim(),
            category: (category?.trim().toUpperCase() === 'SUPER30' ? 'SUPER30' : 'SCHOOL')
          };
        }).filter(e => e.email);

        await api.post('/admin/whitelist/csv', { entries });
        toast.success(`Imported ${entries.length} emails`);
        fetchData();
      } catch (err: any) {
        toast.error('Failed to parse CSV or upload');
      }
    };
    reader.readAsText(file);
  };

  if (loading) return <AdminSkeleton />;

  return (
    <div className="min-h-screen bg-bg selection:bg-primary/20">
      <Navbar />
      
      <main className="max-w-[1500px] mx-auto px-6 pt-32 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-border/40 pb-12 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">
                System Overlord
              </span>
            </div>
            <h1 className="text-4xl font-heading font-black tracking-tight text-content italic leading-tight">
              Platform Metrics <br/> & Network Control.
            </h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className={`card relative overflow-hidden p-6 pl-9 shadow-[0_14px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-border-hover ${stat.shellClass}`}
            >
              <div className={`absolute bottom-5 left-0 top-5 w-[5px] rounded-r-full ${stat.accentClass}`} />
              <div className={`absolute inset-y-0 left-0 w-28 blur-3xl ${stat.glowClass}`} />
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-white/14 via-white/6 to-transparent" />
              <div className="relative flex justify-between items-start mb-4">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">{stat.label}</span>
                <div className={stat.iconClass}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
              </div>
              <div className="relative text-4xl font-heading font-black text-content italic">{stat.val}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-8 animate-fade-in-up">
            {/* Add Manual */}
            <div className="card p-8 bg-surface-high/30">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-6 pl-1 flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" />
                Individual Approval
              </h3>
              <form onSubmit={handleAddEmail} className="space-y-6">
                <div className="group/input">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted/60 mb-2 block pl-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-content focus:bg-bg transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-muted text-sm font-bold"
                    placeholder="hacker@stanford.edu"
                  />
                </div>
                <div className="group/input">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted/60 mb-2 block pl-1">Cohort</label>
                  <select 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-content focus:bg-bg transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-muted text-sm font-black uppercase tracking-widest appearance-none cursor-pointer"
                  >
                    <option value="SCHOOL">SCHOOL COHORT</option>
                    <option value="SUPER30">SUPER30 ELITE</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-primary text-bg py-4 rounded-xl font-heading font-black text-sm uppercase tracking-[0.2em] hover:brightness-90 transition-all active:scale-[0.98] shadow-lg">
                  Approve Entry
                </button>
              </form>
            </div>

            {/* Bulk Import */}
            <div className="card relative overflow-hidden p-8 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_92%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_36%,transparent)_100%)] group shadow-[0_18px_42px_rgba(0,0,0,0.14)]">
              <div className="absolute bottom-6 left-0 top-6 w-[4px] rounded-r-full bg-primary/85 shadow-[0_0_20px_rgba(126,214,255,0.18)]" />
              <div className="absolute inset-y-0 left-0 w-24 bg-primary/6 blur-3xl" />
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-white/14 via-white/8 to-transparent" />
              <h3 className="relative text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-6 pl-1 flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" />
                Whitelist CSV Upload
              </h3>
              <p className="relative mb-4 text-sm leading-7 text-content/74">
                Add multiple whitelist entries in one pass. <br/>
                <span className="text-content/68">Format:</span>{' '}
                <code className="rounded-xl border border-border bg-surface-high px-2.5 py-1 text-[12px] font-medium tracking-[0.04em] text-content/82">
                  email,category
                </code>
              </p>
              <label className="relative flex flex-col items-center justify-center w-full h-32 px-4 transition-all duration-300 bg-surface/50 border border-border rounded-2xl appearance-none cursor-pointer hover:border-primary/35 hover:bg-primary/5 hover:scale-[1.01] group-active:scale-95">
                <div className="absolute inset-[10px] rounded-[18px] border border-dashed border-border/70 transition-colors group-hover:border-primary/35" />
                <svg className="relative mb-2 w-6 h-6 text-muted transition-colors group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span className="relative text-[10px] font-black uppercase tracking-widest text-muted transition-colors group-hover:text-primary">Upload CSV File</span>
                <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          {/* Roster Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card overflow-hidden flex flex-col h-[740px] shadow-2xl border-primary/5">
              {/* Table Tabs */}
              <div className="flex bg-surface-high/20 border-b border-border p-1">
                {[
                  { id: 'whitelist', label: 'Whitelist', color: 'primary' },
                  { id: 'builders', label: 'Builders', color: 'emerald-400' },
                  { id: 'pending', label: 'Pending', color: 'amber-500' },
                  { id: 'recruiters', label: 'Recruiters', color: 'blue-500' },
                  { id: 'deleted', label: 'Deleted', color: 'rose-400' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl ${
                      activeTab === tab.id 
                        ? `bg-bg text-content shadow-lg border border-border/40` 
                        : 'text-muted hover:text-content'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Records Counter */}
              <div className="bg-surface/50 px-6 py-3 border-b border-border/40 flex justify-between items-center capitalize">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">{activeTab} Stream</span>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                 {activeTab === 'whitelist' ? whitelist.length :
                   activeTab === 'builders' ? activeBuilders.length :
                   activeTab === 'pending' ? pendingBuilders.length :
                   activeTab === 'recruiters' ? recruiters.length :
                   deletedMembers.length} Entries
                </span>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar animate-fade-in">
                {activeTab === 'whitelist' && (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-high/30 text-muted sticky top-0 uppercase font-mono text-[9px] font-black tracking-widest z-10 backdrop-blur-md border-b border-border/40">
                      <tr>
                        <th className="px-6 py-4">Digital Identity</th>
                        <th className="px-6 py-4">Cohort</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {whitelist.map((entry) => (
                        <tr key={entry.id} className="hover:bg-surface-high/10 transition-colors group">
                          <td className="px-6 py-5 font-mono text-xs font-bold text-content/70">{entry.email}</td>
                          <td className="px-6 py-5">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                              entry.category === 'SUPER30' 
                                ? 'bg-primary/5 border-primary/20 text-primary' 
                                : 'bg-muted/5 border-muted/20 text-muted/80'
                            }`}>
                              {entry.category}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <button 
                              onClick={() => handleToggle(entry.id)}
                              title={entry.isActive ? 'Pause builder visibility and builder OTP access' : 'Restore builder visibility and builder OTP access'}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                                entry.isActive 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                  : 'bg-red-500/10 border-red-500/30 text-red-500'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${entry.isActive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                              {entry.isActive ? 'Active' : 'Paused'}
                            </button>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <button 
                                onClick={() => handleDelete(entry.id)}
                                title="Delete whitelist entry"
                                className="text-muted/40 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-500/5 group-hover:text-muted"
                              >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'builders' && (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-high/30 text-muted sticky top-0 uppercase font-mono text-[9px] font-black tracking-widest z-10 backdrop-blur-md border-b border-border/40">
                      <tr>
                        <th className="px-6 py-4">Node / Alias</th>
                        <th className="px-6 py-4">Nexus Address</th>
                        <th className="px-6 py-4">Cohort</th>
                        <th className="px-6 py-4 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {activeBuilders.map((user) => (
                        <tr key={user.id} className="hover:bg-surface-high/10 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                                <span className="font-heading font-black text-content italic text-xs leading-none">@{user.profile?.username}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted/60 mt-1">{user.profile?.fullName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-mono text-xs font-bold text-muted/80">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-black border ${
                              user.profile?.category === 'SUPER30' 
                                ? 'bg-primary/5 border-primary/20 text-primary' 
                                : 'bg-muted/5 border-muted/20 text-muted/80'
                            }`}>
                              {user.profile?.category}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-mono text-[10px] text-muted/60">
                            {new Date(user.createdAt).toLocaleDateString().toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Similar treatment for PENDING and RECRUITERS... */}
                {activeTab === 'pending' && (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-high/30 text-muted sticky top-0 uppercase font-mono text-[9px] font-black tracking-widest z-10 backdrop-blur-md border-b border-border/40">
                      <tr>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4">Last Sync</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {pendingBuilders.map((user) => (
                        <tr key={user.id} className="hover:bg-surface-high/10 transition-colors">
                          <td className="px-6 py-5 font-mono text-xs font-bold text-content/70">{user.email}</td>
                          <td className="px-6 py-5 text-muted/60 font-mono text-[10px]">
                            {new Date(user.updatedAt).toLocaleDateString().toUpperCase()}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className="bg-amber-500/10 text-amber-500/80 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Inert Profile</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'recruiters' && (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-high/30 text-muted sticky top-0 uppercase font-mono text-[9px] font-black tracking-widest z-10 backdrop-blur-md border-b border-border/40">
                      <tr>
                        <th className="px-6 py-4">Company Nexus</th>
                        <th className="px-6 py-4">Domain</th>
                        <th className="px-6 py-4 text-right">Onboarded</th>
                        <th className="px-6 py-4 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {recruiters.map((user) => (
                        <tr key={user.id} className="group hover:bg-surface-high/10 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-heading font-black text-content italic text-xs leading-none">{user.recruiterAccount?.companyName || 'Unknown Entity'}</span>
                              <span className="text-[10px] font-mono text-muted/60 mt-1 uppercase tracking-tight">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {user.recruiterAccount?.website ? (
                              <a href={user.recruiterAccount.website} target="_blank" rel="noreferrer" className="text-primary font-bold text-xs hover:underline decoration-2 underline-offset-4 transition-all">
                                {user.recruiterAccount.website.replace(/^https?:\/\//, '')}
                              </a>
                            ) : (
                              <span className="text-muted/20 opacity-50">-</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right font-mono text-[10px] text-muted/60">
                            {new Date(user.createdAt).toLocaleDateString().toUpperCase()}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => handleDeleteRecruiter(user.id)}
                              className="rounded-xl p-2 text-muted/40 transition-colors hover:bg-red-500/5 hover:text-red-500 group-hover:text-muted"
                              title="Delete recruiter"
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'deleted' && (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-high/30 text-muted sticky top-0 uppercase font-mono text-[9px] font-black tracking-widest z-10 backdrop-blur-md border-b border-border/40">
                      <tr>
                        <th className="px-6 py-4">Identity</th>
                        <th className="px-6 py-4">Source</th>
                        <th className="px-6 py-4">Snapshot</th>
                        <th className="px-6 py-4 text-right">Removed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {deletedMembers.map((entry) => (
                        <tr key={entry.id} className="hover:bg-surface-high/10 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-heading font-black text-content italic text-xs leading-none">
                                {entry.kind === 'RECRUITER'
                                  ? entry.deletedCompanyName || entry.deletedName || 'Deleted Recruiter'
                                  : entry.deletedName || (entry.deletedUsername ? `@${entry.deletedUsername}` : 'Deleted Builder')}
                              </span>
                              <span className="mt-1 text-[10px] font-mono text-muted/60 uppercase tracking-tight">
                                {entry.deletedEmail}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                              entry.kind === 'RECRUITER'
                                ? 'bg-sky-400/10 border-sky-400/25 text-sky-300'
                                : 'bg-rose-400/10 border-rose-400/25 text-rose-300'
                            }`}>
                              {entry.kind === 'RECRUITER' ? 'Recruiter' : 'Whitelist'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              {entry.deletedCategory && (
                                <span className={`px-2 py-1 rounded text-[9px] font-black border ${
                                  entry.deletedCategory === 'SUPER30'
                                    ? 'bg-primary/5 border-primary/20 text-primary'
                                    : 'bg-muted/5 border-muted/20 text-muted/80'
                                }`}>
                                  {entry.deletedCategory}
                                </span>
                              )}
                              {entry.deletedUsername && (
                                <span className="px-2 py-1 rounded border border-border/60 bg-surface/50 text-[9px] font-mono font-bold text-content/70">
                                  @{entry.deletedUsername}
                                </span>
                              )}
                              {entry.deletedWebsite && (
                                <a
                                  href={entry.deletedWebsite}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 rounded border border-border/60 bg-surface/50 text-[9px] font-bold text-primary hover:underline decoration-2 underline-offset-4"
                                >
                                  {entry.deletedWebsite.replace(/^https?:\/\//, '')}
                                </a>
                              )}
                              {!entry.deletedCategory && !entry.deletedUsername && !entry.deletedWebsite && (
                                <span className="text-[10px] font-medium text-muted/50">No extra snapshot captured</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-mono text-[10px] text-muted/60">
                                {new Date(entry.deletedAt).toLocaleDateString().toUpperCase()}
                              </span>
                              <span className="mt-1 text-[9px] font-mono text-muted/40">
                                by {entry.deletedByEmail}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-[1500px] mx-auto px-6 pt-32 pb-24">
        <div className="mb-12 border-b border-border/40 pb-12">
          <SkeletonBlock className="mb-4 h-7 w-32 rounded-lg" />
          <SkeletonBlock className="mb-3 h-12 w-72 rounded-xl" />
          <SkeletonBlock className="h-4 w-96 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card relative overflow-hidden p-6 pl-9">
              <div className="absolute bottom-5 left-0 top-5 w-[5px] rounded-r-full bg-surface-high/40" />
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-white/12 via-white/6 to-transparent" />
              <div className="relative flex items-start justify-between mb-4">
                <SkeletonBlock className="h-3 w-28 rounded-full" />
                <SkeletonBlock className="h-5 w-5 rounded-lg" />
              </div>
              <SkeletonBlock className="h-10 w-16 rounded-xl" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 space-y-8">
            <div className="card p-8 bg-surface-high/30">
              <div className="mb-6 flex items-center gap-2">
                <div className="h-3 w-1 rounded-full bg-primary/50" />
                <SkeletonBlock className="h-3 w-32 rounded-full" />
              </div>

              <div className="space-y-6">
                <div>
                  <SkeletonBlock className="mb-3 h-3 w-20 rounded-full" />
                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                </div>
                <div>
                  <SkeletonBlock className="mb-3 h-3 w-16 rounded-full" />
                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                </div>
                <SkeletonBlock className="h-14 w-full rounded-xl" />
              </div>
            </div>

            <div className="card relative overflow-hidden p-8 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_92%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_36%,transparent)_100%)]">
              <div className="absolute bottom-6 left-0 top-6 w-[4px] rounded-r-full bg-primary/55" />
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-white/14 via-white/8 to-transparent" />

              <div className="mb-6 flex items-center gap-2">
                <div className="h-3 w-1 rounded-full bg-primary/50" />
                <SkeletonBlock className="h-3 w-36 rounded-full" />
              </div>

              <div className="space-y-3">
                <SkeletonBlock className="h-3 w-56 rounded-full" />
                <SkeletonBlock className="h-3 w-44 rounded-full" />
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface/50 p-3">
                <div className="rounded-[18px] border border-dashed border-border/70 p-6">
                  <div className="flex flex-col items-center">
                    <SkeletonBlock className="h-6 w-6 rounded-full" />
                    <SkeletonBlock className="mt-3 h-3 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card overflow-hidden flex flex-col h-[740px] shadow-2xl border-primary/5">
              <div className="flex bg-surface-high/20 border-b border-border p-1 gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-12 flex-1 rounded-xl border-0" />
                ))}
              </div>

              <div className="bg-surface/50 px-6 py-3 border-b border-border/40 flex justify-between items-center">
                <SkeletonBlock className="h-3 w-28 rounded-full" />
                <SkeletonBlock className="h-5 w-16 rounded-lg" />
              </div>

              <div className="flex-1 p-0">
                <div className="border-b border-border/20 px-6 py-4">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-6">
                    <SkeletonBlock className="h-3 w-24 rounded-full" />
                    <SkeletonBlock className="h-3 w-16 rounded-full" />
                    <SkeletonBlock className="h-3 w-16 rounded-full" />
                    <SkeletonBlock className="h-3 w-12 rounded-full justify-self-end" />
                  </div>
                </div>

                <div className="divide-y divide-border/20">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="px-6 py-5">
                      <div className="grid items-center grid-cols-[1.5fr_1fr_1fr_80px] gap-6">
                        <div className="space-y-2">
                          <SkeletonBlock className="h-4 w-44 rounded-lg" />
                          <SkeletonBlock className="h-3 w-28 rounded-lg" />
                        </div>
                        <SkeletonBlock className="h-8 w-20 rounded-lg" />
                        <SkeletonBlock className="h-8 w-24 rounded-lg" />
                        <SkeletonBlock className="h-8 w-8 rounded-xl justify-self-end" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
