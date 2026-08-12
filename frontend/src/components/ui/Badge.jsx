const TONE_CLASSES = {
  danger: "bg-dangerbg text-danger",
  warn: "bg-warnbg text-warn",
  ok: "bg-okbg text-ok",
  neutral: "bg-muted text-inkmuted",
};

export default function Badge({ tone = "neutral", children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
