"use client";

import { memo } from "react";
import StepCard, {
  IconBook,
  IconTarget,
  IconSteps,
} from "@/components/StepCard";
import ProgressIndicator from "@/components/ProgressIndicator";
import PortionSelector from "@/components/PortionSelector";
import QuickJuzSelector from "@/components/QuickJuzSelector";
import ThemedSelect from "@/components/ThemedSelect";

function ProgressForm({
  mode,
  formState,
  setFormState,
  onSave,
  onReset,
  error,
  message,
  juzOptions,
  currentRukuhOptions,
  formatRukuhPair,
  getJuzRukuhOptionValue,
  juzCompletion,
  latestProgress,
  selectedJuzNumberInt,
  onSelectJuz,
  applyJuzSavedSelection,
  surahOptions,
  surahMetaByNumber,
  selectedSurahRukuhOptions,
  ayahOptions,
  juzForSelectedAyah,
  juzForSelectedSurahRukuh,
}) {
  const form = formState;

  return (
    <section className="rounded-2xl border border-muted bg-surface p-4 sm:p-5">
      {mode === "juz" ? (
        <div className="space-y-5">
          <QuickJuzSelector
            latestProgress={latestProgress}
            onSelectJuz={onSelectJuz}
            selectedJuzNumber={selectedJuzNumberInt}
          />

          <StepCard step={1} title="Choose Juz" icon={<IconBook />}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-secondary">
                All Juz
              </span>
              <ThemedSelect
                value={form.juz.juzNumber}
                onChange={(nextJuzNumber) =>
                  setFormState((prev) => {
                    const prefill = applyJuzSavedSelection(nextJuzNumber);
                    return {
                      ...prev,
                      juz: {
                        ...prev.juz,
                        juzNumber: nextJuzNumber,
                        selectionType: prefill?.selectionType || "",
                        rukuhNumber: prefill?.rukuhNumber || "",
                        portion: prefill?.portion || "",
                      },
                    };
                  })
                }
                options={juzOptions.map((j) => ({
                  value: j,
                  label: `Juz ${j}`,
                }))}
                placeholder="Select Juz"
                ariaLabel="All Juz"
              />
            </label>
          </StepCard>

          {form.juz.juzNumber ? (
            <StepCard step={2} title="Track by" icon={<IconTarget />}>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      juz: {
                        ...prev.juz,
                        selectionType: "portion",
                        portion: prev.juz.portion || "start",
                        rukuhNumber: "",
                      },
                    }))
                  }
                  className={[
                    "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    form.juz.selectionType === "portion"
                      ? "border-primary bg-primary text-on-primary"
                      : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
                  ].join(" ")}
                  aria-pressed={form.juz.selectionType === "portion"}
                >
                  Portion
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      juz: {
                        ...prev.juz,
                        selectionType: "rukuh",
                        rukuhNumber: prev.juz.rukuhNumber || "",
                        portion: "",
                      },
                    }))
                  }
                  className={[
                    "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    form.juz.selectionType === "rukuh"
                      ? "border-primary bg-primary text-on-primary"
                      : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
                  ].join(" ")}
                  aria-pressed={form.juz.selectionType === "rukuh"}
                >
                  Rukuh
                </button>
              </div>
            </StepCard>
          ) : null}

          {form.juz.juzNumber && form.juz.selectionType ? (
            <StepCard step={3} title="Choose Portion" icon={<IconSteps />}>
              {form.juz.selectionType === "rukuh" ? (
                <div className="space-y-4">
                  {juzCompletion !== null ? (
                    <ProgressIndicator
                      label={`Juz ${form.juz.juzNumber} progress`}
                      value={juzCompletion}
                    />
                  ) : null}

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-text-secondary">
                      Rukuh
                    </span>
                    <span className="mb-3 block text-xs text-text-secondary">
                      Format: Rukuh JuzRukuh,SurahRukuh (Surah)
                    </span>
                    <ThemedSelect
                      value={form.juz.rukuhNumber}
                      onChange={(nextRukuh) =>
                        setFormState((prev) => ({
                          ...prev,
                          juz: {
                            ...prev.juz,
                            rukuhNumber: nextRukuh,
                          },
                        }))
                      }
                      options={[
                        { value: "start", label: "Start of Juz" },
                        ...currentRukuhOptions.map((r, index) => ({
                          value: getJuzRukuhOptionValue(r),
                          label:
                            index === currentRukuhOptions.length - 1
                              ? `${formatRukuhPair(
                                  r.juzRukuh,
                                  r.surahRukuh,
                                  r.surahName,
                                )} · End of Juz`
                              : formatRukuhPair(
                                  r.juzRukuh,
                                  r.surahRukuh,
                                  r.surahName,
                                ),
                        })),
                      ]}
                      placeholder="Select Rukuh"
                      ariaLabel="Rukuh"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  {juzCompletion !== null ? (
                    <ProgressIndicator
                      label={`Juz ${form.juz.juzNumber} progress`}
                      value={juzCompletion}
                    />
                  ) : null}

                  <PortionSelector
                    value={form.juz.portion}
                    onChange={(nextPortion) =>
                      setFormState((prev) => ({
                        ...prev,
                        juz: { ...prev.juz, portion: nextPortion },
                      }))
                    }
                  />
                </div>
              )}
            </StepCard>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-secondary">
              Note (optional)
            </span>
            <input
              type="text"
              value={form.juz.note}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  juz: { ...prev.juz, note: e.target.value },
                }))
              }
              placeholder="Example: mosque reading or personal note"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-all duration-200 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
            >
              Save Progress
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium transition-all duration-200 ease-out hover:bg-surface/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <StepCard step={1} title="Choose Surah" icon={<IconBook />}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-secondary">
                Surah
              </span>
              <ThemedSelect
                value={form.surah.surahNumber}
                onChange={(nextSurahNumber) =>
                  setFormState((prev) => {
                    const meta = surahMetaByNumber[nextSurahNumber];
                    return {
                      ...prev,
                      surah: {
                        ...prev.surah,
                        surahNumber: nextSurahNumber,
                        surahName: meta?.surahName || "",
                        ayahNumber: "",
                        rukuhNumber: "",
                        selectionType: prev.surah.selectionType || "ayah",
                      },
                    };
                  })
                }
                options={surahOptions.map((s) => ({
                  value: String(s.surahNumber),
                  label: `${s.surahNumber}. ${s.surahName}`,
                }))}
                placeholder="Select Surah"
                ariaLabel="Surah"
              />
            </label>
          </StepCard>

          {form.surah.surahNumber ? (
            <StepCard step={2} title="Track by" icon={<IconTarget />}>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      surah: {
                        ...prev.surah,
                        selectionType: "ayah",
                        rukuhNumber: "",
                      },
                    }))
                  }
                  className={[
                    "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    (form.surah.selectionType || "ayah") === "ayah"
                      ? "border-primary bg-primary text-on-primary"
                      : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
                  ].join(" ")}
                  aria-pressed={(form.surah.selectionType || "ayah") === "ayah"}
                >
                  Ayah
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      surah: {
                        ...prev.surah,
                        selectionType: "rukuh",
                        ayahNumber: "",
                      },
                    }))
                  }
                  className={[
                    "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    (form.surah.selectionType || "ayah") === "rukuh"
                      ? "border-primary bg-primary text-on-primary"
                      : "border-border bg-surface text-text-secondary hover:bg-surface/70 hover:text-text-primary",
                  ].join(" ")}
                  aria-pressed={
                    (form.surah.selectionType || "ayah") === "rukuh"
                  }
                >
                  Rukuh
                </button>
              </div>
            </StepCard>
          ) : null}

          {form.surah.surahNumber ? (
            <StepCard
              step={3}
              title={
                (form.surah.selectionType || "ayah") === "rukuh"
                  ? "Choose Rukuh"
                  : "Choose Ayah"
              }
              icon={<IconSteps />}
            >
              {(form.surah.selectionType || "ayah") === "rukuh" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-text-secondary">
                    Rukuh
                  </span>
                  <ThemedSelect
                    value={form.surah.rukuhNumber}
                    onChange={(nextRukuh) =>
                      setFormState((prev) => ({
                        ...prev,
                        surah: { ...prev.surah, rukuhNumber: nextRukuh },
                      }))
                    }
                    options={[
                      { value: "start", label: "Start of Surah" },
                      ...selectedSurahRukuhOptions.map((r, index) => ({
                        value: String(r.surahRukuh),
                        label:
                          index === selectedSurahRukuhOptions.length - 1
                            ? `Rukuh ${r.surahRukuh} · End of Surah`
                            : `Rukuh ${r.surahRukuh}`,
                      })),
                    ]}
                    placeholder="Select Rukuh"
                    ariaLabel="Surah Rukuh"
                  />
                </label>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-text-secondary">
                    Ayah
                  </span>
                  <ThemedSelect
                    value={form.surah.ayahNumber}
                    onChange={(nextAyah) =>
                      setFormState((prev) => ({
                        ...prev,
                        surah: { ...prev.surah, ayahNumber: nextAyah },
                      }))
                    }
                    options={[
                      { value: "start", label: "Start of Surah" },
                      ...ayahOptions.map((a) => ({
                        value: a,
                        label: `Ayah ${a}`,
                      })),
                    ]}
                    placeholder="Select Ayah"
                    ariaLabel="Ayah"
                  />
                </label>
              )}

              {(form.surah.selectionType || "ayah") === "ayah" &&
              juzForSelectedAyah &&
              form.surah.surahNumber ? (
                <div className="rounded-2xl border border-muted bg-surface p-3">
                  <p className="text-sm text-text-secondary">
                    This Ayah is in{" "}
                    <span className="font-semibold text-text-primary">
                      Juz {juzForSelectedAyah.juzNumber}
                    </span>{" "}
                    (Surah Rukuh {juzForSelectedAyah.surahRukuh}).
                  </p>
                </div>
              ) : null}

              {(form.surah.selectionType || "ayah") === "rukuh" &&
              juzForSelectedSurahRukuh &&
              form.surah.surahNumber ? (
                <div className="rounded-2xl border border-muted bg-surface p-3">
                  <p className="text-sm text-text-secondary">
                    This Rukuh maps to{" "}
                    <span className="font-semibold text-text-primary">
                      Juz {juzForSelectedSurahRukuh.juzNumber}
                    </span>{" "}
                    (Surah Rukuh {juzForSelectedSurahRukuh.surahRukuh}).
                  </p>
                </div>
              ) : null}
            </StepCard>
          ) : null}

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-all duration-200 ease-out hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
            >
              Save Progress
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium transition-all duration-200 ease-out hover:bg-surface/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(ProgressForm);
