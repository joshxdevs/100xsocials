import { type ChangeEvent, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import SkeletonBlock from '../components/SkeletonBlock';
import { useAuth } from '../hooks/useAuth';
import type { Profile, ProfileFormData } from '../types/profile';

const EMPTY_FORM: ProfileFormData = {
  avatar: '',
  username: '',
  fullName: '',
  phone: '',
  phonePublic: false,
  about: '',
  city: '',
  country: '',
  currentCompany: '',
  activelyLooking: false,
  hasJobOffers: false,
  jobOffersDesc: '',
  jobUrl: '',
  salaryRange: '',
  jobLocation: '',
  githubUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  portfolioUrl: '',
  aiTags: [],
  resumeUrl: '',
  resumeFilename: '',
  atsScore: null,
  atsFeedback: '',
  techStack: [],
  skills: [],
  interests: [],
};

const STEP_META = [
  {
    number: '01',
    label: 'Identity',
    title: 'Build your profile basics',
    description: 'Upload a profile picture, set your public identity, and describe the work you do best.',
  },
  {
    number: '02',
    label: 'Work & Resume',
    title: 'Add your work status and resume',
    description: 'Upload your resume, review ATS feedback, and tell people whether you are working, open to jobs, or hiring.',
  },
  {
    number: '03',
    label: 'Links',
    title: 'Connect your public footprint',
    description: 'Add the links people should use to find your portfolio and professional profiles.',
  },
] as const;

const JOB_LOCATION_OPTIONS = ['Remote', 'Hybrid', 'On-site'];

function extractErrorMessage(err: any, fallback: string) {
  if (typeof err?.response?.data?.error === 'string') return err.response.data.error;
  if (err?.response?.data?.error?.formErrors?.length) return err.response.data.error.formErrors[0];
  if (err?.response?.data?.error?.fieldErrors) {
    const firstFieldError = Object.values(err.response.data.error.fieldErrors).flat()[0];
    if (typeof firstFieldError === 'string') return firstFieldError;
  }
  return fallback;
}

function normalizeUsername(value: string) {
  return value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function mapProfileToForm(profile: Profile): ProfileFormData {
  return {
    avatar: profile.avatar ?? '',
    username: profile.username ?? '',
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    phonePublic: profile.phonePublic ?? false,
    about: profile.about ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
    currentCompany: profile.currentCompany ?? '',
    activelyLooking: profile.activelyLooking ?? false,
    hasJobOffers: profile.hasJobOffers ?? false,
    jobOffersDesc: profile.jobOffersDesc ?? '',
    jobUrl: profile.jobUrl ?? '',
    salaryRange: profile.salaryRange ?? '',
    jobLocation: profile.jobLocation ?? '',
    githubUrl: profile.githubUrl ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
    twitterUrl: profile.twitterUrl ?? '',
    portfolioUrl: profile.portfolioUrl ?? '',
    aiTags: profile.aiTags?.tags ?? [],
    resumeUrl: profile.resumeUrl ?? '',
    resumeFilename: profile.resumeFilename ?? '',
    atsScore: profile.atsScore ?? null,
    atsFeedback: profile.atsFeedback ?? '',
    techStack: profile.techStack ?? [],
    skills: profile.skills ?? [],
    interests: profile.interests ?? [],
  };
}

function mergeProfileIntoForm(previous: ProfileFormData, profile: Partial<Profile>): ProfileFormData {
  return {
    ...previous,
    avatar: profile.avatar ?? previous.avatar,
    username: profile.username ?? previous.username,
    fullName: profile.fullName ?? previous.fullName,
    phone: profile.phone ?? previous.phone,
    phonePublic: profile.phonePublic ?? previous.phonePublic,
    about: profile.about ?? previous.about,
    city: profile.city ?? previous.city,
    country: profile.country ?? previous.country,
    currentCompany: profile.currentCompany ?? previous.currentCompany,
    activelyLooking: profile.activelyLooking ?? previous.activelyLooking,
    hasJobOffers: profile.hasJobOffers ?? previous.hasJobOffers,
    jobOffersDesc: profile.jobOffersDesc ?? previous.jobOffersDesc,
    jobUrl: profile.jobUrl ?? previous.jobUrl,
    salaryRange: profile.salaryRange ?? previous.salaryRange,
    jobLocation: profile.jobLocation ?? previous.jobLocation,
    githubUrl: profile.githubUrl ?? previous.githubUrl,
    linkedinUrl: profile.linkedinUrl ?? previous.linkedinUrl,
    twitterUrl: profile.twitterUrl ?? previous.twitterUrl,
    portfolioUrl: profile.portfolioUrl ?? previous.portfolioUrl,
    aiTags: profile.aiTags?.tags ?? previous.aiTags,
    resumeUrl: profile.resumeUrl ?? previous.resumeUrl,
    resumeFilename: profile.resumeFilename ?? previous.resumeFilename,
    atsScore: profile.atsScore ?? previous.atsScore,
    atsFeedback: profile.atsFeedback ?? previous.atsFeedback,
    techStack: profile.techStack ?? previous.techStack,
    skills: profile.skills ?? previous.skills,
    interests: profile.interests ?? previous.interests,
  };
}

function buildProfilePayload(formData: ProfileFormData, isCurrentlyWorking: boolean) {
  return {
    avatar: formData.avatar.trim(),
    username: normalizeUsername(formData.username.trim()),
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    phonePublic: formData.phonePublic,
    about: formData.about.trim(),
    city: formData.city.trim(),
    country: formData.country.trim(),
    currentCompany: isCurrentlyWorking ? formData.currentCompany.trim() : '',
    activelyLooking: formData.activelyLooking,
    hasJobOffers: formData.hasJobOffers,
    jobOffersDesc: formData.hasJobOffers ? formData.jobOffersDesc.trim() : '',
    jobUrl: formData.hasJobOffers ? formData.jobUrl.trim() : '',
    salaryRange: formData.hasJobOffers ? formData.salaryRange.trim() : '',
    jobLocation: formData.hasJobOffers ? formData.jobLocation.trim() : '',
    techStack: formData.techStack,
    skills: formData.skills,
    interests: formData.interests,
    portfolioUrl: formData.portfolioUrl.trim(),
    githubUrl: formData.githubUrl.trim(),
    twitterUrl: formData.twitterUrl.trim(),
    linkedinUrl: formData.linkedinUrl.trim(),
    aiTags: formData.aiTags.length > 0 ? formData.aiTags : undefined,
  };
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[24px] border p-5 transition-all duration-300 ${
      checked
        ? 'border-primary/28 bg-primary/10 shadow-[0_18px_35px_rgba(0,0,0,0.12)]'
        : 'border-border bg-surface/70'
    }`}>
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-base font-medium text-content">{label}</p>
          <p className="text-sm leading-6 text-muted">{description}</p>
        </div>
        <input
          type="checkbox"
          className="premium-switch mt-1 shrink-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
    </div>
  );
}

function SectionFrame({
  eyebrow,
  title,
  description,
  action,
  className = '',
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`relative overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_86%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_42%,transparent)_100%)] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.14)] md:p-7 ${className}`}>
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      {(eyebrow || title || description || action) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{eyebrow}</p>}
            {title && <h2 className="mt-2 text-2xl font-heading font-semibold text-content">{title}</h2>}
            {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function TokenInput({
  label,
  helper,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  helper?: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const tokens = draft
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (tokens.length === 0) return;

    const existing = new Set(values.map((item) => item.toLowerCase()));
    const merged = [...values];

    tokens.forEach((token) => {
      const normalized = token.toLowerCase();
      if (!existing.has(normalized)) {
        merged.push(token);
        existing.add(normalized);
      }
    });

    onChange(merged);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
    }

    if (event.key === 'Backspace' && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="input-label mb-0 pl-0">{label}</label>
        {helper && <p className="text-sm leading-6 text-muted">{helper}</p>}
      </div>

      <div className="relative overflow-hidden rounded-[26px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_82%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_36%,transparent)_100%)] p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="flex flex-wrap gap-2.5">
          {values.map((value) => (
            <span key={value} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-high px-3 py-2 text-sm font-medium text-content/85">
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((item) => item !== value))}
                className="text-muted transition-colors hover:text-content"
                aria-label={`Remove ${value}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            className="input-field flex-1"
            placeholder={placeholder}
          />
          <button type="button" onClick={commit} className="btn-ghost px-5 py-3 text-sm">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingSkeletonSection({
  eyebrow,
  titleWidth,
  descriptionLines = 2,
  actionWidth,
  className = '',
  children,
}: {
  eyebrow?: string;
  titleWidth: string;
  descriptionLines?: number;
  actionWidth?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`relative overflow-hidden rounded-[30px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_86%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_42%,transparent)_100%)] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.14)] md:p-7 ${className}`}>
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{eyebrow}</p>}
          <SkeletonBlock className={`mt-2 h-9 ${titleWidth} rounded-xl`} />
          <div className="mt-3 space-y-2">
            {Array.from({ length: descriptionLines }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className={`h-4 ${index === descriptionLines - 1 ? 'w-4/5' : 'w-full'} rounded-lg`}
              />
            ))}
          </div>
        </div>
        {actionWidth && <SkeletonBlock className={`h-12 ${actionWidth} rounded-[20px]`} />}
      </div>
      {children}
    </section>
  );
}

function OnboardingBasicsSkeleton() {
  return (
    <div className="relative space-y-8">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <OnboardingSkeletonSection
          eyebrow="Profile photo"
          titleWidth="w-40"
          descriptionLines={3}
          className="h-full"
        >
          <div className="mt-6 flex flex-col items-center gap-5">
            <SkeletonBlock className="h-36 w-36 rounded-[32px]" />
            <div className="w-full space-y-3">
              <SkeletonBlock className="h-12 w-full rounded-[20px]" />
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-full rounded-lg" />
                <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
              </div>
            </div>
          </div>
        </OnboardingSkeletonSection>

        <OnboardingSkeletonSection
          eyebrow="Identity"
          titleWidth="w-64"
          descriptionLines={2}
        >
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {['Name', 'Username'].map((label, index) => (
                <div key={label}>
                  <label className="input-label">{label}</label>
                  <SkeletonBlock className="h-[58px] w-full rounded-[20px]" />
                  {index === 1 && <SkeletonBlock className="mt-2 h-3 w-56 rounded-lg" />}
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <label className="input-label">Phone number</label>
                <SkeletonBlock className="h-[58px] w-full rounded-[20px]" />
              </div>

              <div className="rounded-[22px] border border-border bg-surface/70 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Display phone</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <SkeletonBlock className="h-4 w-24 rounded-lg" />
                  <SkeletonBlock className="h-6 w-11 rounded-full" />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {['City', 'Country'].map((label) => (
                <div key={label}>
                  <label className="input-label">{label}</label>
                  <SkeletonBlock className="h-[58px] w-full rounded-[20px]" />
                </div>
              ))}
            </div>
          </div>
        </OnboardingSkeletonSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { label: 'Tech stack', helperWidth: 'w-64' },
          { label: 'Skills', helperWidth: 'w-72' },
        ].map((section, index) => (
          <div key={section.label} className="space-y-4">
            <div className="space-y-2">
              <label className="input-label mb-0 pl-0">{section.label}</label>
              <SkeletonBlock className={`h-4 ${section.helperWidth} rounded-lg`} />
            </div>

            <div className="relative overflow-hidden rounded-[26px] border border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_82%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_36%,transparent)_100%)] p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
              <div className="flex flex-wrap gap-2.5">
                {(index === 0 ? ['w-16', 'w-20', 'w-24'] : ['w-24', 'w-20', 'w-18']).map((width, chipIndex) => (
                  <SkeletonBlock key={chipIndex} className={`h-9 ${width} rounded-xl`} />
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <SkeletonBlock className="h-[58px] flex-1 rounded-[20px]" />
                <SkeletonBlock className="h-[58px] w-24 rounded-[20px]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <OnboardingSkeletonSection
        eyebrow="About"
        titleWidth="w-44"
        descriptionLines={2}
        actionWidth="w-40"
      >
        <SkeletonBlock className="mt-5 h-[220px] w-full rounded-[20px]" />

        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">AI tags</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {['w-20', 'w-16', 'w-18'].map((width, index) => (
              <SkeletonBlock key={index} className={`h-8 ${width} rounded-xl`} />
            ))}
          </div>
        </div>
      </OnboardingSkeletonSection>

      <div className="flex justify-end pt-2">
        <SkeletonBlock className="h-12 w-56 rounded-[20px]" />
      </div>
    </div>
  );
}

function OnboardingWorkSkeleton() {
  return (
    <div className="relative space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <OnboardingSkeletonSection
          eyebrow="Resume"
          titleWidth="w-52"
          descriptionLines={2}
          actionWidth="w-36"
        >
          <div className="mt-2 rounded-[24px] border border-dashed border-border-hover bg-surface/75 p-5">
            <SkeletonBlock className="h-4 w-44 rounded-lg" />
            <div className="mt-3 space-y-2">
              <SkeletonBlock className="h-4 w-full rounded-lg" />
              <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
            </div>
          </div>

          <div className="mt-6 rounded-[22px] border border-border bg-surface/75 p-5">
            <SkeletonBlock className="h-4 w-32 rounded-lg" />
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-4 w-full rounded-lg" />
              <SkeletonBlock className="h-4 w-full rounded-lg" />
              <SkeletonBlock className="h-4 w-3/4 rounded-lg" />
            </div>
          </div>
        </OnboardingSkeletonSection>

        <OnboardingSkeletonSection
          eyebrow="ATS score"
          titleWidth="w-40"
          descriptionLines={2}
          className="h-full"
        >
          <div className="mt-2 rounded-[26px] border border-border bg-surface-high/70 p-6">
            <SkeletonBlock className="h-14 w-20 rounded-xl" />
            <div className="mt-4 space-y-2">
              <SkeletonBlock className="h-4 w-full rounded-lg" />
              <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
            </div>
          </div>
        </OnboardingSkeletonSection>
      </div>

      <OnboardingSkeletonSection
        eyebrow="Work status"
        titleWidth="w-[380px]"
        descriptionLines={2}
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="relative overflow-hidden rounded-[24px] border border-border bg-surface/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <SkeletonBlock className={`h-5 rounded-lg ${index === 2 ? 'w-40' : 'w-48'}`} />
                  <SkeletonBlock className="h-4 w-full rounded-lg" />
                  <SkeletonBlock className="h-4 w-5/6 rounded-lg" />
                  <SkeletonBlock className="h-4 w-2/3 rounded-lg" />
                </div>
                <SkeletonBlock className="mt-1 h-6 w-11 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </OnboardingSkeletonSection>

      <OnboardingSkeletonSection
        eyebrow="Current role"
        titleWidth="w-44"
        descriptionLines={1}
      >
        <label className="input-label">Current company</label>
        <SkeletonBlock className="h-[58px] w-full rounded-[20px]" />
      </OnboardingSkeletonSection>

      <OnboardingSkeletonSection
        eyebrow="Hiring details"
        titleWidth="w-52"
        descriptionLines={2}
      >
        <div className="mt-2 grid gap-6 md:grid-cols-3">
          <div>
            <label className="input-label">Job location</label>
            <SkeletonBlock className="h-[58px] w-full rounded-[20px]" />
          </div>

          <div>
            <label className="input-label">Salary range</label>
            <SkeletonBlock className="h-[58px] w-full rounded-[20px]" />
          </div>

          <div className="md:col-span-3">
            <label className="input-label">Job URL</label>
            <SkeletonBlock className="h-[58px] w-full rounded-[20px]" />
          </div>
        </div>
      </OnboardingSkeletonSection>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <SkeletonBlock className="h-12 w-24 rounded-[20px]" />
        <SkeletonBlock className="h-12 w-44 rounded-[20px]" />
      </div>
    </div>
  );
}

function OnboardingLinksSkeleton() {
  return (
    <div className="relative space-y-8">
      <OnboardingSkeletonSection
        eyebrow="Links"
        titleWidth="w-72"
        descriptionLines={2}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {[
            'Portfolio',
            'GitHub',
            'LinkedIn',
            'Twitter / X',
          ].map((label, index) => (
            <div key={label} className="rounded-[22px] border border-border bg-surface/70 p-5">
              <label className="input-label">{label}</label>
              <div className="mb-3 space-y-2">
                <SkeletonBlock className="h-4 w-full rounded-lg" />
                <SkeletonBlock className={`h-4 ${index % 2 === 0 ? 'w-4/5' : 'w-3/4'} rounded-lg`} />
              </div>
              <SkeletonBlock className="h-[58px] w-full rounded-[20px]" />
            </div>
          ))}
        </div>
      </OnboardingSkeletonSection>

      <OnboardingSkeletonSection
        eyebrow="Ready"
        titleWidth="w-44"
        descriptionLines={2}
      >
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-full rounded-lg" />
          <SkeletonBlock className="h-4 w-5/6 rounded-lg" />
        </div>
      </OnboardingSkeletonSection>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <SkeletonBlock className="h-12 w-24 rounded-[20px]" />
        <SkeletonBlock className="h-12 w-44 rounded-[20px]" />
      </div>
    </div>
  );
}

function OnboardingSkeleton({ step }: { step: number }) {
  if (step === 1) return <OnboardingWorkSkeleton />;
  if (step === 2) return <OnboardingLinksSkeleton />;
  return <OnboardingBasicsSkeleton />;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const usernameCheckRef = useRef(0);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(EMPTY_FORM);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'>('idle');

  useEffect(() => {
    if (!user) return;
    if (user.role === 'RECRUITER') {
      navigate('/recruiter', { replace: true });
      return;
    }

    const loadProfile = async () => {
      setSkeletonLoading(true);
      try {
        const res = await api.get<{ profile: Profile }>('/user/profile');
        setFormData(mapProfileToForm(res.data.profile));
        setIsCurrentlyWorking(Boolean(res.data.profile.currentCompany?.trim()));
        setHasExistingProfile(true);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setFormData(EMPTY_FORM);
          setIsCurrentlyWorking(false);
          setHasExistingProfile(false);
        } else {
          toast.error('Failed to load your profile');
        }
      } finally {
        setSkeletonLoading(false);
      }
    };

    void loadProfile();
  }, [navigate, user]);

  useEffect(() => {
    if (!user || skeletonLoading) return;

    const username = normalizeUsername(formData.username.trim());

    if (!username) {
      setUsernameStatus('idle');
      return;
    }

    if (username.length < 2) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const requestId = ++usernameCheckRef.current;

    const timeout = window.setTimeout(async () => {
      try {
        const res = await api.get<{ available: boolean }>('/user/check-username', {
          params: { username },
        });

        if (usernameCheckRef.current !== requestId) return;
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch {
        if (usernameCheckRef.current !== requestId) return;
        setUsernameStatus('error');
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [formData.username, skeletonLoading, user]);

  const updateField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const stepInfo = STEP_META[step];
  const avatarInitial = (formData.fullName.trim()[0] || user?.email?.[0] || '?').toUpperCase();
  const usernameStatusText = {
    idle: 'Lowercase letters, numbers, and underscores only. Changing this updates your public profile URL.',
    checking: 'Checking username availability...',
    available: 'Username is available.',
    taken: 'That username is already taken.',
    invalid: 'Choose at least 2 characters.',
    error: 'Could not verify availability right now.',
  }[usernameStatus];
  const usernameStatusClass = {
    idle: 'text-muted',
    checking: 'text-muted',
    available: 'text-emerald-500',
    taken: 'text-red-500',
    invalid: 'text-amber-500',
    error: 'text-amber-500',
  }[usernameStatus];

  const validateBasics = () => {
    if (!formData.fullName.trim() || !formData.username.trim()) {
      toast.error('Name and username are required before moving on.');
      return false;
    }

    if (normalizeUsername(formData.username.trim()).length < 2) {
      toast.error('Username must be at least 2 characters.');
      return false;
    }

    if (usernameStatus === 'checking') {
      toast.error('Checking username availability. Give it a second.');
      return false;
    }

    if (usernameStatus === 'taken') {
      toast.error('That username is already taken.');
      return false;
    }

    return true;
  };

  const validateWorkSection = () => {
    if (isCurrentlyWorking && !formData.currentCompany.trim()) {
      toast.error('Add your current company or switch off the working toggle.');
      return false;
    }
    return true;
  };

  const saveProfile = async (options?: { silent?: boolean }) => {
    const payload = buildProfilePayload(formData, isCurrentlyWorking);

    if (!payload.fullName || !payload.username) {
      toast.error('Name and username are required.');
      return null;
    }

    if (payload.username.length < 2) {
      toast.error('Username must be at least 2 characters.');
      return null;
    }

    if (usernameStatus === 'checking') {
      toast.error('Checking username availability. Give it a second.');
      return null;
    }

    if (usernameStatus === 'taken') {
      toast.error('That username is already taken.');
      return null;
    }

    if (isCurrentlyWorking && !payload.currentCompany) {
      toast.error('Add your current company or switch off the working toggle.');
      return null;
    }

    try {
      setLoading(true);
      const res = hasExistingProfile
        ? await api.put<{ profile: Profile }>('/user/profile', payload)
        : await api.post<{ profile: Profile }>('/user/onboarding', payload);

      setHasExistingProfile(true);
      setIsCurrentlyWorking(Boolean(res.data.profile.currentCompany?.trim() || payload.currentCompany));
      setFormData((previous) => {
        const merged = mergeProfileIntoForm(previous, res.data.profile);
        return payload.aiTags ? { ...merged, aiTags: payload.aiTags } : merged;
      });

      if (!options?.silent) {
        toast.success(hasExistingProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
      }

      return res.data.profile;
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to save profile'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!formData.about.trim()) {
      toast.error('Write a short bio first so AI tags have something to work with.');
      return;
    }

    try {
      setGeneratingTags(true);
      const res = await api.post<{ tags: string[] }>('/user/generate-ai-tags', {
        about: formData.about,
        techStack: formData.techStack,
        skills: formData.skills,
        interests: formData.interests,
      });
      updateField('aiTags', res.data.tags ?? []);
      toast.success('AI tags generated');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to generate AI tags'));
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Please upload an image smaller than 10MB.');
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      return;
    }

    try {
      setAvatarUploading(true);
      const uploadData = new FormData();
      uploadData.append('avatar', file);

      const res = await api.post<{ url: string }>('/user/avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateField('avatar', res.data.url);
      toast.success('Profile photo uploaded');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to upload image'));
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF resume.');
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }

    if (!validateBasics() || !validateWorkSection()) {
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      return;
    }

    try {
      setResumeUploading(true);
      const profile = await saveProfile({ silent: true });
      if (!profile) return;

      const uploadData = new FormData();
      uploadData.append('resume', file);

      const res = await api.post<{ profile: Profile }>('/user/resume', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setHasExistingProfile(true);
      setFormData((previous) => mergeProfileIntoForm(previous, res.data.profile));
      toast.success('Resume uploaded and reviewed');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to upload resume'));
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const moveToStep = (nextStep: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(nextStep);
  };

  const handleContinueFromBasics = () => {
    if (!validateBasics()) return;
    moveToStep(1);
  };

  const handleContinueFromWork = () => {
    if (!validateWorkSection()) return;
    moveToStep(2);
  };

  const handleSubmit = async () => {
    if (!validateBasics() || !validateWorkSection()) return;
    const profile = await saveProfile();
    if (profile) {
      navigate(`/u/${profile.username}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg selection:bg-primary/20">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
        <div className="mb-12 flex flex-col gap-8">
          <div className="grid gap-4 md:grid-cols-3">
            {STEP_META.map((item, index) => {
              const isActive = index === step;
              const isComplete = index < step;

              return (
                <button
                  key={item.number}
                  type="button"
                  onClick={() => {
                    if (index <= step) moveToStep(index);
                  }}
                  className={`relative overflow-hidden rounded-[28px] border p-5 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-primary/30 bg-primary/10 shadow-[0_20px_40px_rgba(0,0,0,0.12)]'
                      : isComplete
                        ? 'border-border bg-surface/85 hover:border-border-hover hover:shadow-[0_18px_36px_rgba(0,0,0,0.1)]'
                        : 'border-border bg-surface/45'
                  } ${index > step ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-heading font-semibold ${
                      isActive || isComplete ? 'bg-primary text-bg' : 'bg-surface-high text-muted'
                    }`}>
                      {item.number}
                    </span>
                    {isComplete && (
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-primary">Done</span>
                    )}
                  </div>
                  <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{item.label}</p>
                  <p className="mt-2 text-base font-medium text-content">{item.title}</p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="max-w-3xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{stepInfo.label}</p>
              <h1 className="mt-3 text-4xl font-heading font-semibold tracking-tight text-content md:text-5xl">
                {stepInfo.title}
              </h1>
              <p className="mt-4 text-base leading-8 text-muted">
                {stepInfo.description}
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-surface/60 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Profile progress</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-high">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${((step + 1) / STEP_META.length) * 100}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                Step {step + 1} of {STEP_META.length}. Save a profile that feels complete before publishing it.
              </p>
            </div>
          </div>
        </div>

        {skeletonLoading ? (
          <OnboardingSkeleton step={step} />
        ) : (
          <div className="relative overflow-hidden rounded-[36px] border border-border bg-[radial-gradient(circle_at_top_right,rgba(148,215,242,0.1),transparent_28%),linear-gradient(180deg,color-mix(in_srgb,var(--surface)_96%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_28%,transparent)_100%)] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.18)] md:p-10">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
            <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />

            {step === 0 && (
              <div className="relative space-y-8 animate-fade-in">
                <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
                  <SectionFrame
                    eyebrow="Profile photo"
                    title="Public avatar"
                    description="Choose a strong, recognizable image. This is what people will see first in the directory."
                    className="h-full"
                  >

                    <div className="mt-6 flex flex-col items-center gap-5">
                      <div className="relative">
                        <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-[32px] border border-border bg-surface-high text-5xl font-heading font-semibold text-primary/50 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
                          {formData.avatar ? (
                            <img src={formData.avatar} alt={formData.fullName || 'Profile'} className="h-full w-full object-cover" />
                          ) : (
                            avatarInitial
                          )}
                        </div>
                        {avatarUploading && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-[32px] bg-bg/65 text-sm font-medium text-content">
                            Uploading...
                          </div>
                        )}
                      </div>

                      <div className="w-full space-y-3">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={avatarUploading}
                          className="btn-ghost w-full px-5 py-3 text-sm"
                        >
                          {avatarUploading ? 'Uploading image...' : formData.avatar ? 'Replace image' : 'Upload image'}
                        </button>
                        <p className="text-sm leading-6 text-muted">
                          Add a clear profile picture. This becomes your public avatar.
                        </p>
                      </div>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </SectionFrame>

                  <SectionFrame
                    eyebrow="Identity"
                    title="How people recognize you"
                    description="Set the basics recruiters and other builders will use to find and contact you."
                  >
                    <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="input-label">Name</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(event) => updateField('fullName', event.target.value)}
                          className="input-field"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="input-label">Username</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(event) => updateField('username', normalizeUsername(event.target.value))}
                          className={`input-field ${
                            usernameStatus === 'available'
                              ? 'border-emerald-500/30 focus:border-emerald-500/35 focus:ring-emerald-500/10'
                              : usernameStatus === 'taken'
                                ? 'border-red-500/30 focus:border-red-500/35 focus:ring-red-500/10'
                                : usernameStatus === 'invalid'
                                  ? 'border-amber-500/30 focus:border-amber-500/35 focus:ring-amber-500/10'
                                  : ''
                          }`}
                          placeholder="john_doe"
                        />
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          {(usernameStatus === 'checking' || usernameStatus === 'available' || usernameStatus === 'taken') && (
                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                                usernameStatus === 'available'
                                  ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500'
                                  : usernameStatus === 'taken'
                                    ? 'border-red-500/20 bg-red-500/5 text-red-500'
                                    : 'border-border bg-surface-high text-muted'
                              }`}
                            >
                              {usernameStatus === 'available' ? '✓' : usernameStatus === 'taken' ? '!' : '…'}
                            </span>
                          )}
                          <p className={usernameStatusClass}>
                            {usernameStatusText}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div>
                        <label className="input-label">Phone number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(event) => updateField('phone', event.target.value)}
                          className="input-field"
                          placeholder="+1 555 123 4567"
                        />
                      </div>

                      <div className="rounded-[22px] border border-border bg-surface/70 p-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Display phone</p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-sm text-content">Show publicly</span>
                          <input
                            type="checkbox"
                            className="premium-switch"
                            checked={formData.phonePublic}
                            onChange={(event) => updateField('phonePublic', event.target.checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="input-label">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(event) => updateField('city', event.target.value)}
                          className="input-field"
                          placeholder="Delhi"
                        />
                      </div>

                      <div>
                        <label className="input-label">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(event) => updateField('country', event.target.value)}
                          className="input-field"
                          placeholder="India"
                        />
                      </div>
                    </div>
                    </div>
                  </SectionFrame>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <TokenInput
                    label="Tech stack"
                    helper="Type a stack item and press Enter or comma to add it."
                    placeholder="React, Node.js, TypeScript"
                    values={formData.techStack}
                    onChange={(values) => updateField('techStack', values)}
                  />

                  <TokenInput
                    label="Skills"
                    helper="Use this for broader strengths like backend, ML, product, or systems."
                    placeholder="Backend, Data Science, Product"
                    values={formData.skills}
                    onChange={(values) => updateField('skills', values)}
                  />
                </div>

                <SectionFrame
                  eyebrow="About"
                  title="Tell your story"
                  description="Write with enough detail that the directory feels human, not just filtered by keywords."
                  action={
                    <button
                      type="button"
                      onClick={() => void handleGenerateTags()}
                      disabled={generatingTags}
                      className="btn-ghost px-5 py-3 text-sm"
                    >
                      {generatingTags ? 'Generating tags...' : 'Generate AI tags'}
                    </button>
                  }
                >

                  <textarea
                    rows={7}
                    value={formData.about}
                    onChange={(event) => updateField('about', event.target.value)}
                    className="input-field mt-5 min-h-[220px] resize-none leading-8"
                    placeholder="I build fast, thoughtful software with a strong product sense. My focus is full-stack development, developer tools, and systems that scale without losing clarity."
                  />

                  <div className="mt-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">AI tags</p>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {formData.aiTags.length > 0 ? formData.aiTags.map((tag) => (
                        <span key={tag} className="rounded-xl border border-primary/16 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary-light">
                          {tag}
                        </span>
                      )) : (
                        <span className="text-sm text-muted">Generate tags after writing your bio.</span>
                      )}
                    </div>
                  </div>
                </SectionFrame>

                <div className="flex justify-end pt-2">
                  <button type="button" onClick={handleContinueFromBasics} className="btn-primary px-7 py-3.5 text-sm">
                    Continue to Resume & Work
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="relative space-y-8 animate-fade-in">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
                  <SectionFrame
                    eyebrow="Resume"
                    title="Upload for ATS review"
                    description="Upload a PDF resume and wait for the ATS score and review notes."
                    action={
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={resumeUploading}
                        className="btn-primary px-5 py-3 text-sm"
                      >
                        {resumeUploading ? 'Uploading resume...' : formData.resumeUrl ? 'Replace resume' : 'Upload resume'}
                      </button>
                    }
                  >

                    <div className="mt-2 rounded-[24px] border border-dashed border-border-hover bg-surface/75 p-5">
                      <p className="text-sm font-medium text-content">
                        {formData.resumeFilename || 'No resume uploaded yet'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        PDF only. We use your saved bio and stack details to make the ATS feedback more relevant.
                      </p>
                    </div>

                    {formData.atsFeedback && (
                      <div className="mt-6 rounded-[22px] border border-border bg-surface/75 p-5">
                        <p className="text-sm font-medium text-content">Resume review notes</p>
                        <p className="mt-4 text-sm leading-7 text-content/78">{formData.atsFeedback}</p>
                      </div>
                    )}

                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                    />
                  </SectionFrame>

                  <SectionFrame
                    eyebrow="ATS score"
                    title="Resume signal"
                    description="A quick read on how well your resume maps to the profile you are presenting."
                    className="h-full"
                  >
                    <div className="mt-2 rounded-[26px] border border-border bg-surface-high/70 p-6">
                      <p className="text-5xl font-heading font-semibold text-content">
                        {formData.atsScore !== null ? formData.atsScore : '--'}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {formData.atsScore !== null
                          ? 'Updated from your latest uploaded resume.'
                          : 'Upload a resume to see your ATS score and review notes.'}
                      </p>
                    </div>
                  </SectionFrame>
                </div>

                <SectionFrame
                  eyebrow="Work status"
                  title="Tell people where you stand right now"
                  description="These answers shape how you appear on your public profile and to recruiters browsing the network."
                >
                <div className="grid gap-4 xl:grid-cols-3">
                  <ToggleRow
                    label="Are you currently working?"
                    description="Switch this on if you are working now. We will ask for your current company."
                    checked={isCurrentlyWorking}
                    onChange={setIsCurrentlyWorking}
                  />
                  <ToggleRow
                    label="Are you looking for a job?"
                    description="Turn this on if you want recruiters to know you are open to new roles."
                    checked={formData.activelyLooking}
                    onChange={(checked) => updateField('activelyLooking', checked)}
                  />
                  <ToggleRow
                    label="Do you have hiring opportunities?"
                    description="Switch this on if you are hiring and want your opportunity details shown."
                    checked={formData.hasJobOffers}
                    onChange={(checked) => updateField('hasJobOffers', checked)}
                  />
                </div>
                </SectionFrame>

                {isCurrentlyWorking && (
                  <SectionFrame
                    eyebrow="Current role"
                    title="Where you work"
                    description="This shows up as your current company on your public profile."
                  >
                    <label className="input-label">Current company</label>
                    <input
                      type="text"
                      value={formData.currentCompany}
                      onChange={(event) => updateField('currentCompany', event.target.value)}
                      className="input-field"
                      placeholder="Appx"
                    />
                  </SectionFrame>
                )}

                {formData.hasJobOffers && (
                  <SectionFrame
                    eyebrow="Hiring details"
                    title="Share your opportunity"
                    description="Add the essentials so people can understand the role without leaving the page."
                  >
                    <div className="mt-2 grid gap-6 md:grid-cols-3">
                      <div>
                        <label className="input-label">Job location</label>
                        <select
                          value={formData.jobLocation}
                          onChange={(event) => updateField('jobLocation', event.target.value)}
                          className="input-field"
                        >
                          <option value="">Select location</option>
                          {JOB_LOCATION_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="input-label">Salary range</label>
                        <input
                          type="text"
                          value={formData.salaryRange}
                          onChange={(event) => updateField('salaryRange', event.target.value)}
                          className="input-field"
                          placeholder="10-15L"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="input-label">Job URL</label>
                        <input
                          type="url"
                          value={formData.jobUrl}
                          onChange={(event) => updateField('jobUrl', event.target.value)}
                          className="input-field"
                          placeholder="https://jobs.example.com/role"
                        />
                      </div>
                    </div>
                  </SectionFrame>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button type="button" onClick={() => moveToStep(0)} className="btn-ghost px-6 py-3.5 text-sm">
                    Back
                  </button>
                  <button type="button" onClick={handleContinueFromWork} className="btn-primary px-7 py-3.5 text-sm">
                    Continue to Links
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="relative space-y-8 animate-fade-in">
                <SectionFrame
                  eyebrow="Links"
                  title="Connect your public footprint"
                  description="Point people to the places that best represent your work and online presence."
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-[22px] border border-border bg-surface/70 p-5">
                      <label className="input-label">Portfolio</label>
                      <p className="mb-3 text-sm leading-6 text-muted">Your best single link. Portfolio, personal site, or showcase page.</p>
                      <input
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={(event) => updateField('portfolioUrl', event.target.value)}
                        className="input-field"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>

                    <div className="rounded-[22px] border border-border bg-surface/70 p-5">
                      <label className="input-label">GitHub</label>
                      <p className="mb-3 text-sm leading-6 text-muted">Where people can inspect the code behind your work.</p>
                      <input
                        type="url"
                        value={formData.githubUrl}
                        onChange={(event) => updateField('githubUrl', event.target.value)}
                        className="input-field"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div className="rounded-[22px] border border-border bg-surface/70 p-5">
                      <label className="input-label">LinkedIn</label>
                      <p className="mb-3 text-sm leading-6 text-muted">Use this for your more formal public profile.</p>
                      <input
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(event) => updateField('linkedinUrl', event.target.value)}
                        className="input-field"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div className="rounded-[22px] border border-border bg-surface/70 p-5">
                      <label className="input-label">Twitter / X</label>
                      <p className="mb-3 text-sm leading-6 text-muted">Add the account where you share ideas, projects, or public updates.</p>
                      <input
                        type="url"
                        value={formData.twitterUrl}
                        onChange={(event) => updateField('twitterUrl', event.target.value)}
                        className="input-field"
                        placeholder="https://x.com/username"
                      />
                    </div>
                  </div>
                </SectionFrame>

                <SectionFrame eyebrow="Ready" title="Publish your profile">
                  <p className="text-sm leading-7 text-muted">
                    Save this profile to publish your onboarding details. You can come back later to update your resume, links, and work status.
                  </p>
                </SectionFrame>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button type="button" onClick={() => moveToStep(1)} className="btn-ghost px-6 py-3.5 text-sm">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={loading || resumeUploading || avatarUploading}
                    className="btn-primary px-7 py-3.5 text-sm disabled:opacity-50"
                  >
                    {loading ? 'Saving profile...' : hasExistingProfile ? 'Update profile' : 'Create profile'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
