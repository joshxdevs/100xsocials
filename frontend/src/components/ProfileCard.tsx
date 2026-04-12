import { Link } from 'react-router-dom';
import type { Profile } from '../types/profile';

interface Props {
  profile: Profile;
  showBookmark?: boolean;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

export default function ProfileCard({ profile, showBookmark, onBookmark, isBookmarked }: Props) {
  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const location = [profile.city, profile.country].filter(Boolean).join(', ');
  const highlights = [...new Set([...(profile.techStack || []), ...(profile.skills || [])])];
  const visibleHighlights = highlights.slice(0, 6);
  const remainingHighlights = Math.max(highlights.length - visibleHighlights.length, 0);

  return (
    <div className="relative group/card h-full">
      <Link to={`/u/${profile.username}`} className="block h-full">
        <div className="card-hover relative flex h-full min-h-[420px] flex-col overflow-hidden p-7 md:min-h-[450px] md:p-8">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute -right-16 -top-12 h-36 w-36 rounded-full bg-primary/8 blur-3xl opacity-70 transition-transform duration-500 group-hover/card:scale-110" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-6 flex items-start gap-4 pr-12">
              <div className="flex min-w-0 items-start gap-4">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.fullName}
                    className="h-16 w-16 rounded-[20px] border border-border object-cover shadow-[0_12px_24px_rgba(0,0,0,0.22)]"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-border bg-surface-high text-xl font-heading font-bold text-primary/55">
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate text-xl font-heading font-semibold text-content transition-colors duration-300 group-hover/card:text-primary-light">
                    {profile.fullName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                    <span className="font-mono">@{profile.username}</span>
                    {profile.currentCompany && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-border-hover" />
                        <span className="truncate">{profile.currentCompany}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-2">
              {profile.category && (
                <span className={profile.category === 'SUPER30' ? 'badge-super30' : 'badge-school'}>
                  {profile.category === 'SUPER30' ? 'Super30' : 'School'}
                </span>
              )}
              {profile.activelyLooking && <span className="badge-open">Open to work</span>}
              {profile.hasJobOffers && (
                <span className="badge border-border bg-surface-high text-content/80">
                  Hiring
                </span>
              )}
            </div>

            <div className="mt-auto space-y-5">
              <div>
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                  Skills & Tech
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {visibleHighlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-xl border border-border bg-surface-high px-3.5 py-2 text-[12px] font-medium text-content/80"
                    >
                      {item}
                    </span>
                  ))}
                  {visibleHighlights.length === 0 && (
                    <span className="text-[12px] font-medium text-muted">
                      No skills listed yet
                    </span>
                  )}
                </div>
              </div>

              {remainingHighlights > 0 && (
                <span className="block px-1 text-[12px] font-medium text-muted">
                  +{remainingHighlights} more
                </span>
              )}

              <div className="flex flex-wrap gap-2">
                {(profile.aiTags?.tags || []).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-primary/16 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-5 text-[12px] text-muted">
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {location || 'Remote / not listed'}
                </span>
                <span className="text-content/70">View profile</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {showBookmark && onBookmark && (
        <button
          onClick={(e) => { e.preventDefault(); onBookmark(profile.id); }}
          className={`absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-2xl border transition-all duration-300 ${
            isBookmarked
              ? 'border-content bg-content text-bg'
              : 'border-border bg-surface/90 text-muted hover:border-border-hover hover:bg-surface-high hover:text-content'
          }`}
          title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          <svg className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
