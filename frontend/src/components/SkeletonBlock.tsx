interface SkeletonBlockProps {
  className?: string;
  tone?: 'default' | 'predictive' | 'matte';
}

export default function SkeletonBlock({ className = '', tone = 'default' }: SkeletonBlockProps) {
  const toneClass = tone === 'predictive'
    ? 'skeleton-block-predictive'
    : tone === 'matte'
      ? 'skeleton-block-matte'
      : 'skeleton-block';
  return <div className={`${toneClass} rounded-2xl ${className}`.trim()} />;
}
