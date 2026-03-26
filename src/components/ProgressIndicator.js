import React from "react";

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export default function ProgressIndicator({ label, value, blocks = 10 }) {
  const v = clamp01(value);
  const filledCount = Math.round(v * blocks);
  const pct = Math.round(v * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-text-secondary">{label}</div>
        <div className="text-xs font-medium text-text-secondary">{pct}%</div>
      </div>
      <div className="font-mono text-sm" role="img" aria-label={`${label} ${pct}%`}>
        <span className="text-text-secondary/80">[</span>
        {Array.from({ length: blocks }).map((_, i) => {
          const isFilled = i < filledCount;
          return (
            <span key={i} className={isFilled ? "text-primary" : "text-text-secondary/50"}>
              {isFilled ? "█" : "░"}
            </span>
          );
        })}
        <span className="text-text-secondary/80">]</span>
      </div>
    </div>
  );
}

