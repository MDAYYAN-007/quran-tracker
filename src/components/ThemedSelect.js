"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ThemedSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const selected = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value],
  );

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-left text-sm text-text-primary outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <span className={selected ? "text-text-primary" : "text-text-secondary"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <ul className="themed-scrollbar max-h-64 overflow-y-auto p-1" role="listbox">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className={[
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  value === ""
                    ? "bg-primary/15 text-primary"
                    : "text-text-secondary hover:bg-primary/10 hover:text-primary",
                ].join(" ")}
              >
                {placeholder}
              </button>
            </li>

            {options.map((option, index) => {
              const isSelected = String(option.value) === String(value);
              return (
                <li key={`${String(option.value)}-${String(option.label)}-${index}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(String(option.value));
                      setOpen(false);
                    }}
                    className={[
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-primary/15 text-primary"
                        : "text-text-primary hover:bg-primary/10 hover:text-primary",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
