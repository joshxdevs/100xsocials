import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import SkeletonBlock from '../components/SkeletonBlock';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import type { Profile as ProfileData } from '../types/profile';

type ProfileView = ProfileData & { avatarUrl?: string | null };

type ProfileLoadState = 'ready' | 'not-found' | 'error';

function ProfileSkeleton({ showRecruiterRail }: { showRecruiterRail: boolean }) {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto max-w-[1320px] px-6 pb-20 pt-28">
        <section className="card relative overflow-hidden p-8 md:p-10">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
          <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-content/5 to-transparent" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <SkeletonBlock className="h-28 w-28 flex-shrink-0 rounded-[28px] md:h-32 md:w-32" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SkeletonBlock className="h-8 w-28 rounded-xl" />
                  <SkeletonBlock className="h-8 w-24 rounded-xl" />
                  <SkeletonBlock className="h-8 w-16 rounded-xl" />
                </div>

                <div className="mt-5 space-y-3">
                  <SkeletonBlock className="h-14 w-full max-w-[520px] rounded-[20px]" />
                  <SkeletonBlock className="h-4 w-36 rounded-lg" />
                </div>

                <div className="mt-6 space-y-3">
                  <SkeletonBlock className="h-4 w-full max-w-3xl rounded-lg" />
                  <SkeletonBlock className="h-4 w-full max-w-[92%] rounded-lg" />
                  <SkeletonBlock className="h-4 w-full max-w-[68%] rounded-lg" />
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {['Location', 'Current company', 'Joined'].map((label, index) => (
                    <div key={label} className="rounded-[20px] border border-border bg-surface/80 p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{label}</p>
                      <SkeletonBlock className="mt-3 h-4 w-full rounded-lg" />
                      <SkeletonBlock className={`mt-2 h-4 rounded-lg ${index === 0 ? 'w-20' : index === 1 ? 'w-24' : 'w-16'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <SkeletonBlock className="h-12 w-full rounded-[20px]" />
              <SkeletonBlock className="h-12 w-full rounded-[20px]" />

              <section className="rounded-[24px] border border-border bg-surface/85 p-5 shadow-[0_20px_35px_rgba(0,0,0,0.16)]">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Links & contact</p>
                <h2 className="mt-3 text-lg font-heading font-semibold text-content">Where to reach them</h2>

                <div className="mt-6 space-y-3">
                  {[
                    { w1: 'w-16', w2: 'w-28' },
                    { w1: 'w-14', w2: 'w-24' },
                    { w1: 'w-20', w2: 'w-24' },
                    { w1: 'w-18', w2: 'w-20' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-[18px] border border-border bg-surface/80 px-4 py-3">
                      <div>
                        <SkeletonBlock className={`h-4 ${item.w1} rounded-lg`} />
                        <SkeletonBlock className={`mt-2 h-3 ${item.w2} rounded-lg`} />
                      </div>
                      <SkeletonBlock className="h-4 w-4 rounded-full" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <div className={showRecruiterRail ? 'mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]' : 'mt-8'}>
          <div className="space-y-8">
            <section className="card p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Expertise</p>
                  <SkeletonBlock className="mt-3 h-9 w-64 rounded-xl" />
                </div>
                <div className="rounded-2xl border border-border bg-surface-high px-4 py-3 text-right">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">ATS Score</p>
                  <SkeletonBlock className="mt-2 h-7 w-14 rounded-lg" />
                </div>
              </div>

              <div className="mt-8 space-y-8">
                {[
                  { label: 'Tech stack', widths: ['w-16', 'w-20', 'w-24', 'w-16', 'w-20'] },
                  { label: 'Skills', widths: ['w-24', 'w-20', 'w-18', 'w-16'] },
                  { label: 'AI tags', widths: ['w-18', 'w-20', 'w-16'] },
                ].map((section) => (
                  <div key={section.label}>
                    <h3 className="text-sm font-medium text-content">{section.label}</h3>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {section.widths.map((width, chipIndex) => (
                        <SkeletonBlock key={chipIndex} className={`h-9 ${width} rounded-xl`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Signals</p>
              <SkeletonBlock className="mt-3 h-9 w-80 rounded-xl" />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {[
                  { title: 'Current focus', widths: ['w-full', 'w-5/6', 'w-3/4'] },
                  { title: 'Opportunity details', widths: ['w-full', 'w-5/6', 'w-full'] },
                ].map((card) => (
                  <div key={card.title} className="rounded-[22px] border border-border bg-surface/75 p-5">
                    <h3 className="text-sm font-medium text-content">{card.title}</h3>
                    <div className="mt-4 space-y-3">
                      {card.widths.map((width, index) => (
                        <SkeletonBlock key={index} className={`h-4 ${width} rounded-lg`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {[
                  { title: 'What they are hiring for', widths: ['w-full', 'w-full', 'w-4/5'], link: true },
                  { title: 'Resume notes', widths: ['w-full', 'w-full', 'w-3/4'], link: false },
                ].map((card) => (
                  <div key={card.title} className="rounded-[22px] border border-border bg-surface/75 p-5">
                    <h3 className="text-sm font-medium text-content">{card.title}</h3>
                    <div className="mt-4 space-y-3">
                      {card.widths.map((width, index) => (
                        <SkeletonBlock key={index} className={`h-4 ${width} rounded-lg`} />
                      ))}
                    </div>
                    {card.link && <SkeletonBlock className="mt-5 h-4 w-20 rounded-lg" />}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {showRecruiterRail && (
            <aside className="space-y-6">
              <section className="card overflow-hidden">
                <div className="border-b border-border px-6 py-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Recruiter Outreach</p>
                  <h2 className="mt-3 text-xl font-heading font-semibold text-content">Reach out privately</h2>
                  <SkeletonBlock className="mt-3 h-4 w-full rounded-lg" />
                  <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-lg" />
                </div>

                <div className="space-y-5 p-6">
                  <div className="rounded-[18px] border border-border bg-surface/80 px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Recipient</p>
                    <SkeletonBlock className="mt-3 h-4 w-32 rounded-lg" />
                  </div>

                  <div>
                    <label className="input-label">Subject</label>
                    <SkeletonBlock className="h-12 w-full rounded-[20px]" />
                  </div>

                  <div>
                    <label className="input-label">Message</label>
                    <SkeletonBlock className="h-[180px] w-full rounded-[20px]" />
                  </div>

                  <SkeletonBlock className="h-12 w-full rounded-[20px]" />
                  <SkeletonBlock className="h-4 w-full rounded-lg" />
                </div>
              </section>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileUnavailableState({
  username,
  mode,
  onExplore,
  onBack,
}: {
  username?: string;
  mode: 'not-found' | 'error';
  onExplore: () => void;
  onBack: () => void;
}) {
  const title = mode === 'not-found' ? 'This profile is not available publicly.' : 'We could not load this profile.';
  const description = mode === 'not-found'
    ? 'The link may be outdated, or the builder may have been removed from the public network.'
    : 'Something interrupted the request before the profile could load. You can try again from the directory.';

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="mx-auto max-w-[1120px] px-6 pb-20 pt-28">
        <section className="card relative overflow-hidden p-8 md:p-12">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-28 w-full bg-gradient-to-t from-content/5 to-transparent" />

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-border bg-surface-high px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-muted">
              Profile Unavailable
            </span>

            <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-[28px] border border-border bg-surface-high shadow-[0_20px_40px_rgba(0,0,0,0.16)]">
              <svg className="h-9 w-9 text-primary/55" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75L18 18m-6-1.5a6 6 0 1112 0 6 6 0 01-12 0zM4.5 19.5l5.25-5.25" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75h.008v.008h-.008V9.75z" />
              </svg>
            </div>

            <h1 className="mt-8 text-4xl font-heading font-semibold leading-tight text-content md:text-5xl">
              {title}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-8 text-content/74 md:text-[17px]">
              {description}
              {username ? (
                <span className="block mt-2 font-mono text-sm text-muted">
                  Requested handle: @{username}
                </span>
              ) : null}
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={onExplore} className="btn-primary px-6 py-3.5 text-sm">
                Explore Builders
              </button>
              <button onClick={onBack} className="btn-ghost px-6 py-3.5 text-sm">
                Go Back
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadState, setLoadState] = useState<ProfileLoadState>('ready');

  // Message form state
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    void fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setLoadState('ready');
      const res = await api.get<{ profile: ProfileView }>(`/public/users/${username}`);
      setProfile(res.data.profile ?? res.data);
      setSubject(`Opportunity from 100x Socials`);
      setMessage(`Hi ${res.data.profile?.fullName?.split(' ')[0] ?? ''}, I came across your profile on 100x Socials and would love to explore whether there could be a fit between your work and an open role on our team.`);
    } catch (err: any) {
      setProfile(null);
      if (err?.response?.status === 404) {
        setLoadState('not-found');
      } else {
        setLoadState('error');
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!profile) return;
    try {
      setSendingMessage(true);
      await api.post(`/recruiter/contact/${profile.id}`, { message, subject });
      toast.success('Message sent successfully!');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const isRecruiter = user?.role === 'RECRUITER';

  if (loading) {
    return <ProfileSkeleton showRecruiterRail={isRecruiter} />;
  }

  if (!profile) {
    return (
      <ProfileUnavailableState
        username={username}
        mode={loadState === 'error' ? 'error' : 'not-found'}
        onExplore={() => navigate('/explore')}
        onBack={() => navigate(-1)}
      />
    );
  }

  const isOwner = user?.id === profile.userId;
  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const avatarSrc = profile.avatar ?? profile.avatarUrl ?? null;
  const location = [profile.city, profile.country].filter(Boolean).join(', ');
  const downloadResumeHref = `/api/public/users/${profile.username}/resume`;
  const profileSignals = [
    { label: 'Location', value: location || 'Not shared yet' },
    { label: 'Current company', value: profile.currentCompany || 'Independent / not listed' },
    { label: 'Joined', value: joinedDate },
  ];
  const contactLinks = [
    profile.phone
      ? {
          key: 'phone',
          label: 'Phone',
          href: `tel:${profile.phone.replace(/\s+/g, '')}`,
          display: profile.phone,
        }
      : null,
    profile.githubUrl
      ? { key: 'github', label: 'GitHub', href: profile.githubUrl, display: 'Open profile' }
      : null,
    profile.linkedinUrl
      ? { key: 'linkedin', label: 'LinkedIn', href: profile.linkedinUrl, display: 'Open profile' }
      : null,
    profile.twitterUrl
      ? { key: 'twitter', label: 'Twitter / X', href: profile.twitterUrl, display: 'Open profile' }
      : null,
    profile.portfolioUrl
      ? { key: 'portfolio', label: 'Portfolio', href: profile.portfolioUrl, display: 'Visit site' }
      : null,
  ].filter((item): item is { key: string; label: string; href: string; display: string } => Boolean(item));

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="mx-auto max-w-[1320px] px-6 pb-20 pt-28">
        <section className="card relative overflow-hidden p-8 md:p-10">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
          <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-content/5 to-transparent" />

          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-[28px] border border-border bg-surface-high shadow-[0_20px_40px_rgba(0,0,0,0.22)] md:h-32 md:w-32">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-heading font-semibold text-primary/55">
                    {profile.fullName?.[0]}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {profile.category && (
                    <span className={profile.category === 'SUPER30' ? 'badge-super30' : 'badge-school'}>
                      {profile.category === 'SUPER30' ? 'Super30 Fellow' : '100x School'}
                    </span>
                  )}
                  {profile.activelyLooking && <span className="badge-open">Open to work</span>}
                  {profile.hasJobOffers && (
                    <span className="badge border-border bg-surface-high text-content/80">
                      Hiring
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <h1 className="text-4xl font-heading font-semibold leading-tight text-content md:text-5xl">
                    {profile.fullName}
                  </h1>
                  <p className="mt-2 font-mono text-sm text-muted">@{profile.username}</p>
                </div>

                <p className="mt-6 max-w-3xl text-[16px] leading-8 text-content/78 md:text-[17px]">
                  {profile.about || 'This builder has not written a profile summary yet.'}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {profileSignals.map((item) => (
                    <div key={item.label} className="rounded-[20px] border border-border bg-surface/80 p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{item.label}</p>
                      <p className="mt-3 text-sm font-medium leading-6 text-content/88">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {isOwner && (
                <button
                  onClick={() => navigate('/onboarding')}
                  className="btn-primary w-full gap-2 px-5 py-3.5 text-sm"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}

              {profile.resumeUrl && (
                <a href={downloadResumeHref} className="btn-ghost w-full gap-2 px-5 py-3.5 text-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14" />
                  </svg>
                  Download Resume
                </a>
              )}

              <section className="rounded-[24px] border border-border bg-surface/85 p-5 shadow-[0_20px_35px_rgba(0,0,0,0.16)]">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Links & contact</p>
                <h2 className="mt-3 text-lg font-heading font-semibold text-content">Where to reach them</h2>

                <div className="mt-6 space-y-3">
                  {contactLinks.length > 0 ? contactLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.href}
                      target={link.key === 'phone' ? undefined : '_blank'}
                      rel={link.key === 'phone' ? undefined : 'noopener noreferrer'}
                      className="flex items-center justify-between rounded-[18px] border border-border bg-surface/80 px-4 py-3 transition-colors hover:border-border-hover hover:bg-surface-high"
                    >
                      <div>
                        <span className="text-sm font-medium text-content">{link.label}</span>
                        <p className="mt-1 text-xs text-muted">{link.display}</p>
                      </div>
                      {link.key === 'phone' ? (
                        <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.515l.57 2.28a2 2 0 01-.58 1.94l-1.4 1.4a16 16 0 006.586 6.586l1.4-1.4a2 2 0 011.94-.58l2.28.57A2 2 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5m0 0v5m0-5L10 14" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 9v10h10" />
                        </svg>
                      )}
                    </a>
                  )) : (
                    <p className="text-sm leading-6 text-muted">No public contact details have been added yet.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </section>

        <div className={isRecruiter ? 'mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]' : 'mt-8'}>
          <div className="space-y-8">
            <section className="card p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Expertise</p>
                  <h2 className="mt-3 text-2xl font-heading font-semibold text-content">What they work on</h2>
                </div>
                {profile.atsScore !== undefined && profile.atsScore !== null && (
                  <div className="rounded-2xl border border-border bg-surface-high px-4 py-3 text-right">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">ATS Score</p>
                    <p className="mt-1 text-xl font-heading font-semibold text-content">{profile.atsScore}/100</p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="text-sm font-medium text-content">Tech stack</h3>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {profile.techStack.length > 0 ? profile.techStack.map((tech) => (
                      <span key={tech} className="rounded-xl border border-border bg-surface-high px-3 py-1.5 text-sm font-medium text-content/85">
                        {tech}
                      </span>
                    )) : (
                      <span className="text-sm text-muted">No stack listed yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-content">Skills</h3>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {profile.skills.length > 0 ? profile.skills.map((skill) => (
                      <span key={skill} className="rounded-xl border border-border bg-surface-high px-3 py-1.5 text-sm font-medium text-content/85">
                        {skill}
                      </span>
                    )) : (
                      <span className="text-sm text-muted">No skills listed yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-content">AI tags</h3>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {profile.aiTags?.tags?.length ? profile.aiTags.tags.map((tag) => (
                      <span key={tag} className="rounded-xl border border-primary/16 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary-light">
                        {tag}
                      </span>
                    )) : (
                      <span className="text-sm text-muted">No AI tags assigned yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="card p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Signals</p>
              <h2 className="mt-3 text-2xl font-heading font-semibold text-content">Availability and proof of work</h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-border bg-surface/75 p-5">
                  <h3 className="text-sm font-medium text-content">Current focus</h3>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-content/78">
                    <p><span className="text-muted">Company:</span> {profile.currentCompany || 'Not shared yet'}</p>
                    <p><span className="text-muted">Open to work:</span> {profile.activelyLooking ? 'Yes' : 'No'}</p>
                    <p><span className="text-muted">Currently hiring:</span> {profile.hasJobOffers ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="rounded-[22px] border border-border bg-surface/75 p-5">
                  <h3 className="text-sm font-medium text-content">Opportunity details</h3>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-content/78">
                    <p><span className="text-muted">Job location:</span> {profile.jobLocation || 'Not listed'}</p>
                    <p><span className="text-muted">Salary range:</span> {profile.salaryRange || 'Not listed'}</p>
                    <p className="break-all">
                      <span className="text-muted">Job URL:</span>{' '}
                      {profile.jobUrl ? (
                        <a
                          href={profile.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary transition-colors hover:text-primary-light"
                        >
                          {profile.jobUrl}
                        </a>
                      ) : 'Not listed'}
                    </p>
                  </div>
                </div>
              </div>

              {(profile.jobOffersDesc || profile.atsFeedback || profile.jobUrl) && (
                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                  {profile.jobOffersDesc && (
                    <div className="rounded-[22px] border border-border bg-surface/75 p-5">
                      <h3 className="text-sm font-medium text-content">What they are hiring for</h3>
                      <p className="mt-4 text-sm leading-7 text-content/78">{profile.jobOffersDesc}</p>
                      {profile.jobUrl && (
                        <a href={profile.jobUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-light">
                          View role
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5m0 0v5m0-5L10 14" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9v10h10" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}

                  {profile.atsFeedback && (
                    <div className="rounded-[22px] border border-border bg-surface/75 p-5">
                      <h3 className="text-sm font-medium text-content">Resume notes</h3>
                      <p className="mt-4 text-sm leading-7 text-content/78">{profile.atsFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {isRecruiter && (
            <aside className="space-y-6">
              <section className="card overflow-hidden">
                <div className="border-b border-border px-6 py-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Recruiter Outreach</p>
                  <h2 className="mt-3 text-xl font-heading font-semibold text-content">Reach out privately</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Send a short introduction through 100x Socials.
                  </p>
                </div>

                <div className="space-y-5 p-6">
                  <div className="rounded-[18px] border border-border bg-surface/80 px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Recipient</p>
                    <p className="mt-2 text-sm font-medium text-content">{profile.fullName}</p>
                  </div>

                  <div>
                    <label className="input-label">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input-field"
                      placeholder="Opportunity from 100x Socials"
                    />
                  </div>

                  <div>
                    <label className="input-label">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="input-field min-h-[180px] resize-none"
                      placeholder="Share why you are reaching out and what kind of opportunity you have in mind."
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !message.trim()}
                    className="btn-primary w-full gap-2 px-5 py-3.5 text-sm"
                  >
                    <svg className="h-4 w-4 rotate-[-35deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                  <p className="text-xs leading-5 text-muted">
                    The builder receives this as a recruiter contact request from within the platform.
                  </p>
                </div>
              </section>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
