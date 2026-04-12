type BrandMarkProps = {
  size?: 'sm' | 'md';
};

const SIZE_STYLES: Record<NonNullable<BrandMarkProps['size']>, {
  frame: string;
  text: string;
}> = {
  sm: {
    frame: 'h-10 w-10 rounded-[16px]',
    text: 'text-[12px] tracking-[-0.08em]',
  },
  md: {
    frame: 'h-11 w-11 rounded-[18px]',
    text: 'text-[13px] tracking-[-0.08em]',
  },
};

export default function BrandMark({ size = 'md' }: BrandMarkProps) {
  const styles = SIZE_STYLES[size];

  return (
    <div
      className={`relative isolate flex shrink-0 items-center justify-center overflow-hidden border border-black/8 bg-[#212529] text-[#f8f9fa] shadow-[0_14px_30px_rgba(0,0,0,0.12)] ${styles.frame}`}
      aria-hidden="true"
    >
      <span className={`translate-y-[0.06em] font-heading font-black leading-none text-inherit ${styles.text}`}>
        100x
      </span>
    </div>
  );
}
