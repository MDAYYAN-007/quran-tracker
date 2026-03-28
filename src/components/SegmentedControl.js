"use client";

import { useRef } from "react";

export default function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel = "Segmented control",
}) {
  const buttonRefs = useRef([]);
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => String(o.value) === String(value)),
  );

  const highlightWidth = `${100 / Math.max(options.length, 1)}%`;
  const highlightTransform = `translateX(${activeIndex * 100}%)`;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="relative inline-flex w-full rounded-full border border-border bg-surface p-1"
      onKeyDown={(e) => {
        if (options.length < 2) return;
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (activeIndex + delta + options.length) % options.length;
        onChange(options[nextIndex].value);
        buttonRefs.current[nextIndex]?.focus();
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-1 rounded-full bg-primary transition-all duration-200 ease-out"
        style={{ width: highlightWidth, transform: highlightTransform }}
      />

      {options.map((opt, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            className={[
              "relative z-10 flex-1 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              isActive
                ? "text-on-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-surface/60",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

