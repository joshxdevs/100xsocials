import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import BuilderCardSkeleton from '../components/BuilderCardSkeleton';
import ProfileCard from '../components/ProfileCard';
import SkeletonBlock from '../components/SkeletonBlock';
import { useAuth } from '../hooks/useAuth';
import type { Bookmark, Profile, RecruiterProfileResponse } from '../types/profile';

const normalizeToken = (value?: string | null) => value?.trim().toLowerCase() ?? '';

function RecruiterSidebarSkeleton() {
  return (
    <aside className="lg:col-span-1 space-y-10 sticky top-32">
      <div className="card p-6 bg-surface-high/30 border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-4">
            <SkeletonBlock className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2.5">
              <SkeletonBlock className="h-5 w-36 rounded-lg" />
              <SkeletonBlock className="h-3 w-24 rounded-full" />
            </div>
          </div>

          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_82%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_22%,transparent)_100%)] p-6 shadow-[0_18px_36px_rgba(0,0,0,0.08)]">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/18 to-transparent" />
        <div className="relative z-10 space-y-8">
          <section>
            <div className="mb-4 pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-muted">
              Talent Status
            </div>
            <div className="space-y-3">
              <SkeletonBlock className="h-12 w-full rounded-xl" />
              <SkeletonBlock className="h-12 w-full rounded-xl" />
            </div>
          </section>

          <section>
            <div className="mb-4 pl-1 text-[11px] font-black uppercase tracking-[0.2em] text-muted">
              Focus Areas
            </div>
            <div className="flex flex-wrap gap-2">
              {['w-16', 'w-20', 'w-24', 'w-14', 'w-[4.5rem]', 'w-20', 'w-16', 'w-[5.5rem]'].map((width, index) => (
                <SkeletonBlock key={index} className={`h-8 ${width} rounded-lg`} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}

function RecruiterDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-bg selection:bg-primary/20">
      <Navbar />

      <main className="max-w-[1500px] mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-border/40 pb-12">
          <div>
            <div className="mb-4">
              <SkeletonBlock className="h-7 w-36 rounded-lg" />
            </div>
            <div className="space-y-3">
              <SkeletonBlock className="h-12 w-full max-w-[28rem] rounded-xl" />
              <SkeletonBlock className="h-12 w-full max-w-[18rem] rounded-xl" />
            </div>
          </div>

          <div className="w-full md:w-auto md:min-w-[320px]">
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_88%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_30%,transparent)_100%)] px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/16 to-transparent" />
              <div className="relative z-10">
                <div className="mb-4">
                  <SkeletonBlock className="h-3 w-28 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/60 bg-surface/55 p-4">
                    <SkeletonBlock className="h-3 w-20 rounded-full" />
                    <div className="mt-3 space-y-2">
                      <SkeletonBlock className="h-8 w-12 rounded-lg" />
                      <SkeletonBlock className="h-3 w-16 rounded-full" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface/55 p-4">
                    <SkeletonBlock className="h-3 w-20 rounded-full" />
                    <div className="mt-3 space-y-2">
                      <SkeletonBlock className="h-8 w-12 rounded-lg" />
                      <SkeletonBlock className="h-3 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          <RecruiterSidebarSkeleton />

          <div className="lg:col-span-3 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex h-fit w-full max-w-xs gap-1 rounded-2xl border border-border bg-surface p-1 shadow-inner">
                <div className="flex w-full gap-1">
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-border/60 bg-bg px-5 py-3 shadow-lg">
                    <SkeletonBlock className="h-3 w-28 rounded-full border-0" />
                  </div>
                  <div className="flex flex-1 items-center justify-center px-5 py-3">
                    <SkeletonBlock className="h-3 w-24 rounded-full border-0" />
                  </div>
                </div>
              </div>

              <div className="relative flex-1 w-full md:max-w-[38rem]">
                <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(148,215,242,0.08),transparent_38%)] opacity-70 blur-xl" />
                <div className="dashboard-search-shell relative">
                  <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary/8 to-transparent opacity-90" />
                  <div className="absolute inset-y-0 left-5 z-10 flex items-center text-muted/45">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="relative z-10 px-14 py-[1.125rem]">
                    <SkeletonBlock className="h-5 w-full max-w-[22rem] rounded-full border-0" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <SkeletonBlock className="h-4 w-36 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <BuilderCardSkeleton key={index} showBookmark />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RecruiterDash() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'bookmarks'>('explore');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookmarks, setBookmarks] = useState<Profile[]>([]);
  const [techOptions, setTechOptions] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<Set<string>>(new Set());
  const [hiringStatus, setHiringStatus] = useState<'looking' | 'offers' | ''>('');
  const [stats, setStats] = useState({ bookmarksCount: 0, companyName: '', website: '' });

  useEffect(() => {
    if (!user || user.role !== 'RECRUITER') return;
    void fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, bookmarksRes, recruiterRes] = await Promise.all([
        api.get<{ users: Profile[] }>('/public/users?limit=50'),
        api.get<{ bookmarks: Bookmark[] }>('/recruiter/bookmarks'),
        api.get<RecruiterProfileResponse>('/recruiter/profile'),
      ]);

      const nextProfiles = profilesRes.data.users ?? [];
      const bookmarkRecords = bookmarksRes.data.bookmarks ?? [];
      const bookmarkProfiles = bookmarkRecords.map((bookmark) => bookmark.profile);

      setProfiles(nextProfiles);
      setBookmarks(bookmarkProfiles);
      setStats({
        bookmarksCount: recruiterRes.data.stats.bookmarksCount,
        companyName: recruiterRes.data.account?.companyName ?? '',
        website: recruiterRes.data.account?.website ?? '',
      });

      const techSet = new Set<string>();
      nextProfiles.forEach((profile) => {
        profile.techStack?.forEach((tech) => techSet.add(tech));
        profile.aiTags?.tags?.forEach((tag) => techSet.add(tag));
      });
      setTechOptions(Array.from(techSet).sort());
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (profileId: string) => {
    try {
      const isBookmarked = bookmarks.some((bookmark) => bookmark.id === profileId);

      if (isBookmarked) {
        await api.delete(`/recruiter/bookmark/${profileId}`);
        setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== profileId));
        setStats((prev) => ({ ...prev, bookmarksCount: Math.max(0, prev.bookmarksCount - 1) }));
        toast.success('Removed from bookmarks');
        return;
      }

      await api.post('/recruiter/bookmark', { profileId });
      const targetProfile = profiles.find((profile) => profile.id === profileId);
      if (targetProfile) {
        setBookmarks((prev) => [...prev, targetProfile]);
        setStats((prev) => ({ ...prev, bookmarksCount: prev.bookmarksCount + 1 }));
      }
      toast.success('Added to bookmarks');
    } catch {
      toast.error('Action failed');
    }
  };

  const filteredProfiles = useMemo(() => {
    const source = activeTab === 'explore' ? profiles : bookmarks;
    return source.filter((profile) => {
      const normalizedQuery = normalizeToken(query);
      const normalizedCombinedTags = [...(profile.techStack || []), ...(profile.aiTags?.tags || [])].map((tag) => normalizeToken(tag));

      const matchesQuery = !query
        || profile.fullName.toLowerCase().includes(normalizedQuery)
        || profile.username.toLowerCase().includes(normalizedQuery)
        || profile.currentCompany?.toLowerCase().includes(normalizedQuery)
        || profile.about?.toLowerCase().includes(normalizedQuery)
        || normalizedCombinedTags.some((tag) => tag.includes(normalizedQuery));

      const matchesStatus = !hiringStatus
        || (hiringStatus === 'looking' && profile.activelyLooking)
        || (hiringStatus === 'offers' && profile.hasJobOffers);

      const matchesTech = selectedTech.size === 0
        || [...selectedTech].every((tech) => normalizedCombinedTags.includes(normalizeToken(tech)));

      return matchesQuery && matchesStatus && matchesTech;
    });
  }, [activeTab, bookmarks, hiringStatus, profiles, query, selectedTech]);

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
  };

  const clearFilters = () => {
    setQuery('');
    setHiringStatus('');
    setSelectedTech(new Set());
  };

  const isFiltering = Boolean(query || hiringStatus || selectedTech.size > 0);

  if (loading) return <RecruiterDashboardSkeleton />;

  return (
    <div className="min-h-screen bg-bg selection:bg-primary/20">
      <Navbar />

      <main className="max-w-[1500px] mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-border/40 pb-12 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">
                Recruiter Portal
              </span>
            </div>
            <h1 className="text-4xl font-heading font-black tracking-tight text-content italic leading-tight">
              Curate Your Elite <br /> High-Proof Squad.
            </h1>
          </div>

          <div className="w-full md:w-auto md:min-w-[320px]">
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_88%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_30%,transparent)_100%)] px-5 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/16 to-transparent" />
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Pipeline Snapshot</span>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/60 bg-surface/55 px-4 py-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted/70">Bookmarked</span>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-heading font-black text-primary leading-none">{stats.bookmarksCount}</span>
                      <span className="pb-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted/60">Profiles</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface/55 px-4 py-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted/70">Talent Pool</span>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-heading font-black text-content leading-none">{profiles.length}</span>
                      <span className="pb-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted/60">Profiles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          <aside className="lg:col-span-1 space-y-10 sticky top-32">
            <div className="card p-6 bg-surface-high/30 border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center text-primary font-heading font-black text-xl shadow-lg">
                  {stats.companyName?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-content group-hover:text-primary transition-colors cursor-default">
                    {stats.companyName || 'Recruiter Account'}
                  </h3>
                  {stats.website && (
                    <a
                      href={stats.website.startsWith('http') ? stats.website : `https://${stats.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      Company Site
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth={3} />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              <button className="w-full bg-surface border border-border text-xs font-black uppercase tracking-[0.2em] py-3 rounded-xl text-muted cursor-default">
                Recruiter Access Active
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_82%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_22%,transparent)_100%)] p-6 shadow-[0_18px_36px_rgba(0,0,0,0.08)] animate-fade-in-up">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/18 to-transparent" />
              <div className="relative z-10 space-y-8">
                {isFiltering && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2.5 border border-dashed border-red-500/30 text-red-500/70 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500/5 transition-all"
                  >
                    Clear All Filters
                  </button>
                )}

                <section>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-4 block pl-1">Talent Status</label>
                  <div className="space-y-3">
                    {[
                      { id: 'looking', label: 'Open to Work' },
                      { id: 'offers', label: 'Hiring' },
                    ].map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setHiringStatus(hiringStatus === status.id ? '' : status.id as 'looking' | 'offers')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                          hiringStatus === status.id
                            ? 'bg-primary border-primary text-bg shadow-lg shadow-primary/10 scale-[1.02]'
                            : 'bg-surface border-border text-muted hover:border-muted/50'
                        }`}
                      >
                        {status.label}
                        <div className={`w-2 h-2 rounded-full ${hiringStatus === status.id ? 'bg-bg shadow-[0_0_8px_white]' : 'bg-muted/20'}`} />
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-4 block pl-1">Focus Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {techOptions.slice(0, 15).map((tech) => (
                      <button
                        key={tech}
                        onClick={() => toggleTech(tech)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                          selectedTech.has(tech)
                            ? 'bg-content border-content text-bg'
                            : 'bg-surface border-border text-muted hover:border-muted/60'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 animate-slide-up">
              <div className="flex p-1 bg-surface border border-border rounded-2xl gap-1 shadow-inner h-fit max-w-xs w-full">
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeTab === 'explore' ? 'bg-bg text-content shadow-lg border border-border/60' : 'text-muted hover:text-content'
                  }`}
                >
                  Explore Pool
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeTab === 'bookmarks' ? 'bg-bg text-content shadow-lg border border-border/60' : 'text-muted hover:text-content'
                  }`}
                >
                  Bookmarked
                </button>
              </div>

              <div className="relative group flex-1 md:max-w-[38rem] w-full">
                <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(148,215,242,0.08),transparent_38%)] opacity-70 blur-xl transition-opacity duration-500 group-focus-within:opacity-100" />
                <div className="dashboard-search-shell relative">
                  <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary/8 to-transparent opacity-90" />
                  <div className="absolute inset-y-0 left-5 z-10 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-muted/60 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search builders, skills, or companies"
                    className="dashboard-search-input relative z-10 border-0 bg-transparent pl-14 pr-6 py-[1.125rem] outline-none font-semibold text-[17px]"
                  />
                </div>
              </div>
            </div>

            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in">
                {filteredProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    showBookmark
                    onBookmark={handleBookmark}
                    isBookmarked={bookmarks.some((bookmark) => bookmark.id === profile.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center card bg-surface-high/20 border-dashed border-2 animate-fade-in-up">
                <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted/30">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-xl font-heading font-black text-content/40 italic mb-2">
                  {activeTab === 'bookmarks' && !isFiltering ? 'No bookmarked profiles yet.' : 'No profiles match right now.'}
                </p>
                <p className="text-muted text-sm font-medium">
                  {activeTab === 'bookmarks' && !isFiltering
                    ? 'Profiles you bookmark will stay here for quick follow-up.'
                    : 'Try adjusting your filters or search query.'}
                </p>
                {isFiltering && (
                  <button onClick={clearFilters} className="mt-8 text-xs font-black uppercase tracking-widest text-primary hover:brightness-90 transition-all">
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
