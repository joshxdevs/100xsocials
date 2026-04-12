import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';
import BuilderCardSkeleton from '../components/BuilderCardSkeleton';
import SkeletonBlock from '../components/SkeletonBlock';
import { useAuth } from '../hooks/useAuth';
import type { Bookmark, Profile } from '../types/profile';

const TECH_OPTIONS = ['React', 'Node.js', 'Solidity', 'Python', 'Rust', 'TypeScript', 'Go', 'Next.js'];

const normalizeToken = (value?: string | null) => value?.trim().toLowerCase() ?? '';

function DirectoryFilterSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_82%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_22%,transparent)_100%)] p-6 shadow-[0_18px_36px_rgba(0,0,0,0.08)] lg:sticky lg:top-32">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/18 to-transparent" />
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-black tracking-tight text-content">Filters</h2>
          <SkeletonBlock className="h-4 w-12 rounded-full" />
        </div>

        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Program</h3>
          <div className="space-y-2">
            <SkeletonBlock className="h-11 w-full rounded-xl" />
            <SkeletonBlock className="h-11 w-full rounded-xl" />
            <SkeletonBlock className="h-11 w-full rounded-xl" />
          </div>
        </div>

        <div className="h-px w-full bg-border/40" />

        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Availability</h3>
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-8 w-14 rounded-md" />
            <SkeletonBlock className="h-8 w-24 rounded-md" />
            <SkeletonBlock className="h-8 w-16 rounded-md" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Tech Stack</h3>
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Directory() {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [techQuery, setTechQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [selectedTech, setSelectedTech] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    void fetchData();
  }, [category, user?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, bookmarksRes] = await Promise.all([
        api.get<{ users: Profile[] }>(`/public/users${category ? `?category=${category}` : ''}`),
        user?.role === 'RECRUITER'
          ? api.get<{ bookmarks: Bookmark[] }>('/recruiter/bookmarks')
          : Promise.resolve({ data: { bookmarks: [] as Bookmark[] } }),
      ]);

      setUsers(profilesRes.data.users ?? []);

      if (user?.role === 'RECRUITER') {
        setBookmarkedIds(new Set(bookmarksRes.data.bookmarks.map((bookmark) => bookmark.profileId)));
      } else {
        setBookmarkedIds(new Set());
      }
    } catch {
      toast.error('Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (profileId: string) => {
    try {
      if (bookmarkedIds.has(profileId)) {
        await api.delete(`/recruiter/bookmark/${profileId}`);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
        toast.success('Removed from bookmarks');
      } else {
        await api.post('/recruiter/bookmark', { profileId });
        setBookmarkedIds((prev) => new Set(prev).add(profileId));
        toast.success('Added to bookmarks');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const filteredUsers = useMemo(() => (
    users.filter((profile) => {
      const normalizedSearch = normalizeToken(search);
      const normalizedAiTags = (profile.aiTags?.tags || []).map((tag) => normalizeToken(tag));
      const normalizedCombinedTechTerms = [...(profile.techStack || []), ...(profile.aiTags?.tags || [])]
        .map((term) => normalizeToken(term));
      const normalizedTechQuery = normalizeToken(techQuery);

      const matchesSearch = !search
        || profile.fullName?.toLowerCase().includes(normalizedSearch)
        || profile.username?.toLowerCase().includes(normalizedSearch)
        || profile.currentCompany?.toLowerCase().includes(normalizedSearch)
        || profile.about?.toLowerCase().includes(normalizedSearch)
        || normalizedAiTags.some((tag) => tag.includes(normalizedSearch));

      const matchesLocation = !location
        || profile.city?.toLowerCase().includes(location.toLowerCase())
        || profile.country?.toLowerCase().includes(location.toLowerCase());

      const matchesStatus = !status
        || (status === 'LOOKING' && profile.activelyLooking)
        || (status === 'HIRING' && profile.hasJobOffers);

      const matchesTech = selectedTech.size === 0
        || [...selectedTech].every((tech) =>
          normalizedCombinedTechTerms.some((term) => term.includes(normalizeToken(tech)))
        );

      const matchesTechQuery = !techQuery
        || normalizedCombinedTechTerms.some((term) => term.includes(normalizedTechQuery));

      return matchesSearch && matchesLocation && matchesStatus && matchesTech && matchesTechQuery;
    })
  ), [location, search, selectedTech, status, techQuery, users]);

  const filteredTechOptions = useMemo(() => (
    TECH_OPTIONS.filter((tech) => tech.toLowerCase().includes(techQuery.trim().toLowerCase()))
  ), [techQuery]);

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setTechQuery('');
    setCategory('');
    setLocation('');
    setStatus('');
    setSelectedTech(new Set());
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-72 flex-shrink-0">
            {loading ? (
              <DirectoryFilterSkeleton />
            ) : (
              <div className="relative overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_82%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_22%,transparent)_100%)] p-6 shadow-[0_18px_36px_rgba(0,0,0,0.08)] lg:sticky lg:top-32">
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/18 to-transparent" />
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-black tracking-tight text-content">Filters</h2>
                    {(search || techQuery || category || location || status || selectedTech.size > 0) && (
                      <button onClick={clearFilters} className="text-xs font-mono font-bold text-muted hover:text-content transition-colors uppercase tracking-widest">
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Program</h3>
                    <div className="space-y-2">
                      {[
                        { id: '', label: 'All Builders' },
                        { id: 'SUPER30', label: 'Super30 Fellowship' },
                        { id: 'SCHOOL', label: '100x School' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setCategory(option.id)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            category === option.id
                              ? 'bg-surface-high text-content shadow-sm ring-1 ring-border'
                              : 'text-muted hover:text-content hover:bg-surface/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-border/40" />

                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Availability</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: '', label: 'Any' },
                        { id: 'LOOKING', label: 'Open to Work' },
                        { id: 'HIRING', label: 'Hiring' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setStatus(option.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            status === option.id
                              ? 'bg-primary text-bg'
                              : 'bg-surface-high/40 text-muted border border-border hover:border-muted/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">Tech Stack</h3>
                    <div className="relative group">
                      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                        <svg className="h-4 w-4 text-muted/70 group-focus-within:text-content transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={techQuery}
                        onChange={(e) => setTechQuery(e.target.value)}
                        placeholder="Type a stack or tag..."
                        className="w-full rounded-xl border border-border bg-surface/60 py-3 pl-11 pr-4 text-sm text-content placeholder:text-muted/55 transition-all focus:border-muted/60 focus:bg-bg focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredTechOptions.map((tech) => (
                        <button
                          key={tech}
                          onClick={() => toggleTech(tech)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium text-center border transition-all ${
                            selectedTech.has(tech)
                              ? 'bg-surface-high border-muted text-content'
                              : 'bg-transparent border-border text-muted hover:border-muted/40 hover:text-content'
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                    {techQuery && filteredTechOptions.length === 0 && (
                      <p className="text-xs leading-6 text-muted">
                        No preset buttons match. Results are still being filtered by <span className="font-medium text-content/80">{techQuery}</span>.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-12">
              <h1 className="text-5xl font-heading font-black tracking-tight text-content mb-3">
                Explore <span className="text-muted">Builders</span>
              </h1>
              <p className="text-lg text-muted max-w-xl leading-relaxed">
                Connect with the top 1% of developers, founders, and designers within the 100x ecosystem.
              </p>
            </div>

            {loading ? (
              <div className="mb-12 relative max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface/45 shadow-sm">
                <div className="absolute inset-y-0 left-5 flex items-center">
                  <SkeletonBlock className="h-5 w-5 rounded-full border-0" />
                </div>
                <div className="px-14 py-4">
                  <SkeletonBlock className="h-6 w-72 rounded-lg border-0" />
                </div>
              </div>
            ) : (
              <div className="mb-12 relative group max-w-3xl">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-muted group-focus-within:text-content transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, tags, or company..."
                  className="directory-search-input w-full bg-surface/50 border border-border rounded-2xl pl-14 pr-6 py-4 text-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-muted"
                />
              </div>
            )}

            {loading ? (
              <>
                <div className="mb-8 border-b border-border/40 pb-4">
                  <SkeletonBlock className="h-4 w-36 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <BuilderCardSkeleton
                      key={index}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                  <span className="text-sm font-mono text-muted">
                    Showing <span className="text-content font-bold">{filteredUsers.length}</span> results
                  </span>
                </div>

                {filteredUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredUsers.map((profile) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        showBookmark={user?.role === 'RECRUITER'}
                        isBookmarked={bookmarkedIds.has(profile.id)}
                        onBookmark={handleBookmark}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 rounded-3xl border-2 border-dashed border-border/40">
                    <div className="mb-4 inline-flex w-16 h-16 rounded-full bg-surface-high/50 items-center justify-center">
                      <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-heading font-bold text-content mb-2">No builders found</h2>
                    <p className="text-muted mb-8">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2.5 bg-surface-high border border-border rounded-full text-sm font-bold text-content hover:bg-border transition-all shadow-sm"
                    >
                      Reset all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
