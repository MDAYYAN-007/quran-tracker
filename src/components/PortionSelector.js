"use client";

const portions = [
  { value: "start", label: "Start" },
  { value: "quarter", label: "1/4" },
  { value: "half", label: "1/2" },
  { value: "threeQuarter", label: "3/4" },
  { value: "end", label: "End" },
];

export default function PortionSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {portions.map((p) => {
        const isActive = String(value) === p.value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            aria-pressed={isActive}
            className={[
              "cursor-pointer rounded-full px-3 py-2 text-xs font-medium transition-all duration-200 ease-out",
              "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              isActive
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
            ].join(" ")}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

