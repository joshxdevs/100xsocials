export default function TagChip({ text, onRemove }: { text: string; onRemove?: () => void }) {
  return (
    <span className="tag-chip">
      {text}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 text-content opacity-30 hover:opacity-100 hover:text-red-400 transition-colors leading-none"
        >
          &times;
        </button>
      )}
    </span>
  );
}
