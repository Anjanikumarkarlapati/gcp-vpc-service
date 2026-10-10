const TONES = {
  critical: { label: "Denied", icon: "M6 6l12 12M18 6L6 18" },
  good: { label: "Allowed", icon: "M5 12.5l4.5 4.5L19 7.5" },
  warning: { label: "Dry-run", icon: "M12 5v9M12 18.5v.5" },
  info: { label: "Info", icon: "M12 11v6M12 7v.5" },
  muted: { label: "Pending", icon: "M7 12h10" },
};

export function Icon({ d, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Status is never colour alone: colour + icon + word.
export default function Status({ tone, children }) {
  const t = TONES[tone];
  return (
    <span className={`status status-${tone}`}>
      <Icon d={t.icon} />
      {children ?? t.label}
    </span>
  );
}
