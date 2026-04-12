import SkeletonBlock from './SkeletonBlock';

const BUILDER_CARD_SKELETONS = [
  {
    titleWidth: 'w-[13rem]',
    usernameWidth: 'w-16',
    companyWidth: 'w-14',
    badgeWidths: ['w-16', 'w-28', 'w-16'],
    chipRows: [
      ['w-24', 'w-28', 'w-20'],
      ['w-[5.25rem]', 'w-32'],
    ],
    moreWidth: 'w-12',
    tagWidths: ['w-14', 'w-28'],
    locationWidth: 'w-24',
    ctaWidth: 'w-20',
  },
  {
    titleWidth: 'w-[11.5rem]',
    usernameWidth: 'w-20',
    companyWidth: 'w-16',
    badgeWidths: ['w-16'],
    chipRows: [
      ['w-20', 'w-24', 'w-20'],
      ['w-28'],
    ],
    moreWidth: 'w-12',
    tagWidths: [],
    locationWidth: 'w-28',
    ctaWidth: 'w-[4.5rem]',
  },
  {
    titleWidth: 'w-[14rem]',
    usernameWidth: 'w-[4.5rem]',
    companyWidth: 'w-12',
    badgeWidths: ['w-20', 'w-24'],
    chipRows: [
      ['w-[4.75rem]', 'w-16', 'w-[4.75rem]'],
      ['w-20', 'w-28'],
      ['w-16'],
    ],
    moreWidth: 'w-16',
    tagWidths: ['w-14', 'w-[4.75rem]'],
    locationWidth: 'w-32',
    ctaWidth: 'w-24',
  },
];

interface BuilderCardSkeletonProps {
  showBookmark?: boolean;
  variantIndex?: number;
  tone?: 'default' | 'predictive' | 'matte';
}

export default function BuilderCardSkeleton({
  showBookmark,
  variantIndex = 0,
  tone = 'default',
}: BuilderCardSkeletonProps) {
  const variant = BUILDER_CARD_SKELETONS[variantIndex % BUILDER_CARD_SKELETONS.length];
  const isPredictive = tone === 'predictive';
  const isMatte = tone === 'matte';

  return (
    <div
      className={`card relative flex min-h-[420px] flex-col overflow-hidden p-7 md:min-h-[450px] md:p-8 ${
        isPredictive
          ? 'predictive-shell border-primary/10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_90%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_44%,transparent)_100%)] shadow-[0_24px_48px_rgba(0,0,0,0.2)]'
          : isMatte
            ? 'matte-shell border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_96%,transparent)_0%,color-mix(in_srgb,var(--surface-high)_18%,transparent)_100%)] shadow-[0_12px_28px_rgba(0,0,0,0.08)]'
            : ''
      }`}
    >
      {!isPredictive && !isMatte && <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/16 to-transparent" />}
      <div className={`absolute -right-16 -top-12 h-36 w-36 rounded-full blur-3xl ${isPredictive ? 'bg-primary/10' : isMatte ? 'bg-content/5 opacity-60' : 'bg-primary/6'}`} />
      {showBookmark && <SkeletonBlock tone={tone} className="absolute right-5 top-5 h-9 w-9 rounded-2xl" />}

      <div className="relative z-10 flex h-full flex-col">
        <div className={`mb-6 flex items-start ${showBookmark ? 'pr-12' : ''}`}>
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="shrink-0">
              <SkeletonBlock tone={tone} className="h-16 w-16 rounded-[20px]" />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <SkeletonBlock tone={tone} className={`h-7 rounded-xl ${variant.titleWidth}`} />
              <div className="mt-2 flex items-center gap-2">
                <SkeletonBlock tone={tone} className={`h-4 rounded-full ${variant.usernameWidth}`} />
                <SkeletonBlock tone={tone} className="h-1.5 w-1.5 rounded-full" />
                <SkeletonBlock tone={tone} className={`h-4 rounded-full ${variant.companyWidth}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {variant.badgeWidths.map((width, index) => (
            <SkeletonBlock key={index} tone={tone} className={`h-8 rounded-xl ${width}`} />
          ))}
        </div>

        <div className="mt-auto space-y-5">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Skills & Tech</p>
            <div className="space-y-2.5">
              {variant.chipRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-wrap gap-2.5">
                  {row.map((width, chipIndex) => (
                    <SkeletonBlock key={`${rowIndex}-${chipIndex}`} tone={tone} className={`h-9 rounded-xl ${width}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <SkeletonBlock tone={tone} className={`h-4 ${variant.moreWidth} rounded-lg`} />

          {variant.tagWidths.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {variant.tagWidths.map((width, index) => (
                <SkeletonBlock key={index} tone={tone} className={`h-8 rounded-xl ${width}`} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/60 pt-5">
            <div className="flex items-center gap-2">
              <SkeletonBlock tone={tone} className="h-3.5 w-3.5 rounded-full" />
              <SkeletonBlock tone={tone} className={`h-4 ${variant.locationWidth} rounded-full`} />
            </div>
            <SkeletonBlock tone={tone} className={`h-4 ${variant.ctaWidth} rounded-full`} />
          </div>
        </div>
      </div>
    </div>
  );
}
