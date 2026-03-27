"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import juzRukuhMap from "@/data/juz-rukuh-map.json";
import juzSurahAyahRangeMap from "@/data/juz-surah-ayah-range-map.json";
import toast from "react-hot-toast";
import SegmentedControl from "@/components/SegmentedControl";
import ContinueReadingCard from "@/components/ContinueReadingCard";
import ProgressForm from "@/components/ProgressForm";

const HistoryPanel = dynamic(() => import("@/components/HistoryPanel"), {
  loading: () => (
    <section className="rounded-2xl border border-muted bg-surface p-4 sm:p-5">
      <div className="h-6 w-36 rounded bg-border" />
      <div className="mt-3 h-16 rounded-2xl bg-border" />
    </section>
  ),
});

const STORAGE_KEY = "quran-tracker";
const portionParts = ["start", "quarter", "half", "threeQuarter", "end"];

const portionPartLabel = {
  start: "Start of Juz",
  quarter: "Quarter",
  half: "Half",
  threeQuarter: "3/4",
  end: "End of Juz",
};
const portionCompactLabel = {
  start: "Start",
  quarter: "1/4",
  half: "1/2",
  threeQuarter: "3/4",
  end: "End",
};

const juzOptions = Array.from({ length: 30 }, (_, i) => String(i + 1));

const initialState = {
  activeMode: "juz",
  forms: {
    juz: {
      juzNumber: "1",
      selectionType: "portion",
      rukuhNumber: "1",
      portion: "start",
      note: "",
    },
    surah: {
      surahNumber: "",
      surahName: "",
      ayahNumber: "",
      selectionType: "ayah",
      rukuhNumber: "",
    },
  },
  latest: {
    juz: null,
    surah: null,
  },
  history: [],
};

const emptyJuzForm = {
  juzNumber: "",
  selectionType: "portion",
  rukuhNumber: "",
  portion: "start",
  note: "",
};

const emptySurahForm = {
  surahNumber: "",
  surahName: "",
  ayahNumber: "",
  selectionType: "ayah",
  rukuhNumber: "",
};

const formatRukuhPair = (juzRukuh, surahRukuh, surahName) => {
  const left = juzRukuh ?? "?";
  const right = surahRukuh ?? "?";
  return `Rukuh ${left}, ${right}${surahName ? ` (${surahName})` : ""}`;
};

const getJuzRukuhOptionValue = (item) =>
  `${String(item.juzRukuh)}:${String(item.surahRukuh)}:${String(item.surahNumber)}`;

const normalizeJuzRukuhNumber = (value) => {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  return raw.includes(":") ? raw.split(":")[0] : raw;
};

export default function Home() {
  const [data, setData] = useState(initialState);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  const persistProgress = (nextData) => {
    const persisted = {
      latest: {
        juz: nextData.latest?.juz ?? null,
        surah: nextData.latest?.surah ?? null,
      },
      history: Array.isArray(nextData.history)
        ? nextData.history.slice(0, 5)
        : [],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  };

  useEffect(() => {
    let rafId = 0;
    rafId = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setData({
            ...initialState,
            latest: {
              juz: parsed.latest?.juz ?? null,
              surah: parsed.latest?.surah ?? null,
            },
            history: Array.isArray(parsed.history)
              ? parsed.history.slice(0, 5)
              : [],
          });
        }
      } catch {
        setError("Could not load saved progress. You can save again.");
      } finally {
        setIsReady(true);
      }
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const currentRukuhOptions = useMemo(() => {
    if (!data.forms.juz.juzNumber) return [];
    return juzRukuhMap[data.forms.juz.juzNumber] || [];
  }, [data.forms.juz.juzNumber]);

  const selectedRukuhMeta = useMemo(() => {
    if (!data.forms.juz.rukuhNumber) return null;
    if (data.forms.juz.rukuhNumber === "start") return null;
    return (
      currentRukuhOptions.find(
        (item) =>
          String(data.forms.juz.rukuhNumber) === getJuzRukuhOptionValue(item) ||
          String(item.juzRukuh) === String(data.forms.juz.rukuhNumber),
      ) || null
    );
  }, [currentRukuhOptions, data.forms.juz.rukuhNumber]);

  const { surahMetaByNumber, surahMaxAyahByNumber, surahOptions } =
    useMemo(() => {
      const metaByNumber = {};
      const maxAyahByNumber = {};

      for (const segments of Object.values(juzSurahAyahRangeMap)) {
        for (const seg of segments) {
          const key = String(seg.surahNumber);
          if (!metaByNumber[key]) {
            metaByNumber[key] = {
              surahNumber: seg.surahNumber,
              surahName: seg.surahName,
              surahNameArabic: seg.surahNameArabic,
            };
          }
          maxAyahByNumber[key] = Math.max(
            maxAyahByNumber[key] || 0,
            seg.ayahEnd,
          );
        }
      }

      const options = Object.values(metaByNumber).sort(
        (a, b) => Number(a.surahNumber) - Number(b.surahNumber),
      );

      return {
        surahMetaByNumber: metaByNumber,
        surahMaxAyahByNumber: maxAyahByNumber,
        surahOptions: options,
      };
    }, []);

  const selectedSurahMaxAyah =
    surahMaxAyahByNumber[data.forms.surah.surahNumber] || null;
  const selectedSurahMeta =
    surahMetaByNumber[data.forms.surah.surahNumber] || null;

  const ayahOptions = useMemo(() => {
    const max = Number(selectedSurahMaxAyah);
    if (!Number.isInteger(max) || max < 1) return [];
    return Array.from({ length: max }, (_, i) => String(i + 1));
  }, [selectedSurahMaxAyah]);

  const selectedSurahRukuhOptions = useMemo(() => {
    const target = Number(data.forms.surah.surahNumber);
    if (!Number.isInteger(target) || target < 1) return [];

    const mapByRukuh = {};
    for (const arr of Object.values(juzRukuhMap)) {
      for (const item of arr) {
        if (Number(item.surahNumber) !== target) continue;
        const rukuhKey = String(item.surahRukuh);
        if (!mapByRukuh[rukuhKey]) {
          mapByRukuh[rukuhKey] = {
            surahRukuh: item.surahRukuh,
          };
        }
      }
    }

    return Object.values(mapByRukuh).sort(
      (a, b) => Number(a.surahRukuh) - Number(b.surahRukuh),
    );
  }, [data.forms.surah.surahNumber]);

  const selectedSurahRukuhMeta = useMemo(() => {
    if (!data.forms.surah.rukuhNumber) return null;
    return (
      selectedSurahRukuhOptions.find(
        (item) =>
          String(item.surahRukuh) === String(data.forms.surah.rukuhNumber),
      ) || null
    );
  }, [selectedSurahRukuhOptions, data.forms.surah.rukuhNumber]);

  const selectedSurahRukuhRepresentativeAyah = useMemo(() => {
    const surahNumber = Number(data.forms.surah.surahNumber);
    const surahRukuh = Number(data.forms.surah.rukuhNumber);
    if (
      !Number.isInteger(surahNumber) ||
      surahNumber < 1 ||
      !Number.isInteger(surahRukuh) ||
      surahRukuh < 1
    ) {
      return "";
    }

    let minAyahStart = Infinity;
    for (const segments of Object.values(juzSurahAyahRangeMap)) {
      for (const seg of segments) {
        if (
          Number(seg.surahNumber) === surahNumber &&
          Number(seg.surahRukuh) === surahRukuh
        ) {
          minAyahStart = Math.min(minAyahStart, Number(seg.ayahStart));
        }
      }
    }
    return Number.isFinite(minAyahStart) ? String(minAyahStart) : "";
  }, [data.forms.surah.surahNumber, data.forms.surah.rukuhNumber]);

  const juzForSelectedAyah = useMemo(() => {
    const surahNumber = Number(data.forms.surah.surahNumber);
    const ayahNumber = Number(data.forms.surah.ayahNumber);

    if (
      !Number.isInteger(surahNumber) ||
      surahNumber < 1 ||
      !Number.isInteger(ayahNumber) ||
      ayahNumber < 1
    ) {
      return null;
    }

    for (const [juzKey, segments] of Object.entries(juzSurahAyahRangeMap)) {
      const juzNumber = Number(juzKey);
      for (const seg of segments) {
        if (seg.surahNumber !== surahNumber) continue;
        if (ayahNumber >= seg.ayahStart && ayahNumber <= seg.ayahEnd) {
          return { juzNumber, surahRukuh: seg.surahRukuh };
        }
      }
    }
    return null;
  }, [data.forms.surah.ayahNumber, data.forms.surah.surahNumber]);

  const juzForSelectedSurahRukuh = useMemo(() => {
    const surahNumber = Number(data.forms.surah.surahNumber);
    const surahRukuhNumber = Number(data.forms.surah.rukuhNumber);
    if (
      !Number.isInteger(surahNumber) ||
      surahNumber < 1 ||
      !Number.isInteger(surahRukuhNumber) ||
      surahRukuhNumber < 1
    ) {
      return null;
    }

    for (const [juzKey, segments] of Object.entries(juzRukuhMap)) {
      const juzNumber = Number(juzKey);
      for (const item of segments) {
        if (
          Number(item.surahNumber) === surahNumber &&
          Number(item.surahRukuh) === surahRukuhNumber
        ) {
          return { juzNumber, surahRukuh: item.surahRukuh };
        }
      }
    }
    return null;
  }, [data.forms.surah.rukuhNumber, data.forms.surah.surahNumber]);

  const validate = () => {
    if (data.activeMode === "juz") {
      const juz = Number(data.forms.juz.juzNumber);
      if (!Number.isInteger(juz) || juz < 1 || juz > 30) {
        return "Juz number must be between 1 and 30.";
      }
      if (!data.forms.juz.selectionType) {
        return "Select Rukuh or Portion.";
      }
      if (!["rukuh", "portion"].includes(data.forms.juz.selectionType)) {
        return "Select Rukuh or Portion.";
      }
      if (data.forms.juz.selectionType === "rukuh") {
        if (data.forms.juz.rukuhNumber === "start") {
          return "";
        }
        if (
          !currentRukuhOptions.some(
            (item) =>
              String(data.forms.juz.rukuhNumber) ===
                getJuzRukuhOptionValue(item) ||
              String(item.juzRukuh) === String(data.forms.juz.rukuhNumber),
          )
        ) {
          return "Select a valid Rukuh for this Juz.";
        }
      }
      if (data.forms.juz.selectionType === "portion") {
        if (!portionParts.includes(data.forms.juz.portion)) {
          return "Select one of the 5 portion steps.";
        }
      }
      return "";
    }

    const surahNumberStr = data.forms.surah.surahNumber;
    const surah = Number(surahNumberStr);
    const ayah = Number(data.forms.surah.ayahNumber);
    const surahSelectionType = data.forms.surah.selectionType || "ayah";

    if (
      !surahNumberStr ||
      !Number.isInteger(surah) ||
      surah < 1 ||
      surah > 114
    ) {
      return "Select a Surah.";
    }
    if (!["ayah", "rukuh"].includes(surahSelectionType)) {
      return "Select Ayah or Rukuh.";
    }

    if (surahSelectionType === "ayah") {
      const maxAyah = Number(selectedSurahMaxAyah);
      if (data.forms.surah.ayahNumber === "start") {
        return "";
      }
      if (!Number.isInteger(ayah) || ayah < 1) {
        return "Select an Ayah.";
      }
      if (Number.isInteger(maxAyah) && ayah > maxAyah) {
        return "Select a valid Ayah for this Surah.";
      }
      return "";
    }

    const selectedSurahRukuh = Number(data.forms.surah.rukuhNumber);
    if (data.forms.surah.rukuhNumber === "start") {
      return "";
    }
    if (
      !Number.isInteger(selectedSurahRukuh) ||
      !selectedSurahRukuhOptions.some(
        (item) => Number(item.surahRukuh) === selectedSurahRukuh,
      )
    ) {
      return "Select a valid Rukuh for this Surah.";
    }
    return "";
  };

  const saveProgress = () => {
    const validationError = validate();
    if (validationError) {
      setMessage("");
      setError(validationError);
      return;
    }

    const now = new Date().toISOString();
    const historyEntry =
      data.activeMode === "juz"
        ? {
            id: `juz-${Date.now()}`,
            mode: "juz",
            savedAt: now,
            payload: {
              juzNumber: data.forms.juz.juzNumber,
              selectionType: data.forms.juz.selectionType,
              rukuhNumber:
                data.forms.juz.selectionType === "rukuh"
                  ? selectedRukuhMeta
                    ? String(selectedRukuhMeta.juzRukuh)
                    : normalizeJuzRukuhNumber(data.forms.juz.rukuhNumber)
                  : "",
              surahRukuhNumber:
                data.forms.juz.selectionType === "rukuh" && selectedRukuhMeta
                  ? selectedRukuhMeta.surahRukuh
                  : "",
              rukuhSurahName:
                data.forms.juz.selectionType === "rukuh" && selectedRukuhMeta
                  ? selectedRukuhMeta.surahName
                  : "",
              portion:
                data.forms.juz.selectionType === "portion"
                  ? data.forms.juz.portion
                  : "",
              note: data.forms.juz.note.trim(),
            },
          }
        : {
            id: `surah-${Date.now()}`,
            mode: "surah",
            savedAt: now,
            payload: {
              surahNumber: data.forms.surah.surahNumber,
              surahName: (
                selectedSurahMeta?.surahName ||
                data.forms.surah.surahName ||
                ""
              ).trim(),
              selectionType: data.forms.surah.selectionType || "ayah",
              ayahNumber:
                (data.forms.surah.selectionType || "ayah") === "rukuh"
                  ? data.forms.surah.rukuhNumber === "start"
                    ? "start"
                    : selectedSurahRukuhRepresentativeAyah
                  : data.forms.surah.ayahNumber,
              rukuhNumber:
                (data.forms.surah.selectionType || "ayah") === "rukuh"
                  ? data.forms.surah.rukuhNumber
                  : "",
            },
          };

    const lastEntry = data.history[0];
    if (
      lastEntry &&
      JSON.stringify(lastEntry.payload) === JSON.stringify(historyEntry.payload)
    ) {
      return;
    }

    const updatedHistory = [historyEntry, ...data.history].slice(0, 5);
    const updatedData = {
      ...data,
      latest: {
        ...data.latest,
        [data.activeMode]: historyEntry,
      },
      history: updatedHistory,
    };

    setData(updatedData);
    persistProgress(updatedData);
    setError("");
    setMessage("Progress saved.");
    toast.success("Progress saved");
  };

  const resetCurrentMode = () => {
    const updatedData =
      data.activeMode === "juz"
        ? { ...data, forms: { ...data.forms, juz: { ...emptyJuzForm } } }
        : { ...data, forms: { ...data.forms, surah: { ...emptySurahForm } } };

    setData(updatedData);
    persistProgress(updatedData);
    setError("");
    setMessage("Current tab progress reset.");
  };

  const clearHistory = () => {
    const updatedData = {
      ...data,
      latest: { juz: null, surah: null },
      history: [],
    };
    setData(updatedData);
    persistProgress(updatedData);
    setError("");
    setMessage("");
    toast.success("History cleared");
  };

  const latestJuz = data.latest.juz;
  const latestSurah = data.latest.surah;
  const recentHistory = data.history.slice(0, 8);

  const getSurahNameByNumber = (surahNumber) => {
    if (surahNumber === null || surahNumber === undefined || surahNumber === "")
      return "";
    return surahMetaByNumber[String(surahNumber)]?.surahName || "";
  };

  const formatSurahProgress = (payload) => {
    if (!payload) return "Surah · Ayah";
    const name = payload.surahName || getSurahNameByNumber(payload.surahNumber);
    if (payload.selectionType === "rukuh" && payload.rukuhNumber === "start") {
      return `Surah ${payload.surahNumber}${name ? ` (${name})` : ""} · Start`;
    }
    if (payload.selectionType === "ayah" && payload.ayahNumber === "start") {
      return `Surah ${payload.surahNumber}${name ? ` (${name})` : ""} · Start`;
    }
    if (payload.selectionType === "rukuh" && payload.rukuhNumber) {
      return `Surah ${payload.surahNumber}${name ? ` (${name})` : ""} · Rukuh ${payload.rukuhNumber}`;
    }
    return `Surah ${payload.surahNumber}${name ? ` (${name})` : ""} · Ayah ${payload.ayahNumber}`;
  };

  const formatJuzProgress = (payload) => {
    if (!payload) return "Juz · Start";
    if (payload.selectionType === "rukuh" && payload.rukuhNumber === "start") {
      return `Juz ${payload.juzNumber} · Start`;
    }
    return `Juz ${payload.juzNumber} · ${
      payload.selectionType === "rukuh"
        ? formatRukuhPair(
            normalizeJuzRukuhNumber(payload.rukuhNumber),
            payload.surahRukuhNumber,
            payload.rukuhSurahName,
          )
        : portionCompactLabel[payload.portion] || payload.portion
    }`;
  };

  const latestJuzNumberInt = Number(latestJuz?.payload?.juzNumber);
  const prevJuz = Number.isInteger(latestJuzNumberInt)
    ? latestJuzNumberInt - 1
    : null;
  const nextJuz = Number.isInteger(latestJuzNumberInt)
    ? latestJuzNumberInt + 1
    : null;
  const selectedJuzNumberInt = Number(data.forms.juz.juzNumber);

  const portionToCompletion = {
    start: 0,
    quarter: 0.25,
    half: 0.5,
    threeQuarter: 0.75,
    end: 1,
  };

  const juzCompletion = (() => {
    const juzNumberInt = Number(data.forms.juz.juzNumber);
    if (
      !Number.isInteger(juzNumberInt) ||
      juzNumberInt < 1 ||
      juzNumberInt > 30
    ) {
      return null;
    }

    if (data.forms.juz.selectionType === "portion") {
      const v = portionToCompletion[data.forms.juz.portion];
      return typeof v === "number" ? v : null;
    }

    if (data.forms.juz.selectionType === "rukuh") {
      if (data.forms.juz.rukuhNumber === "start") return 0;
      const options = currentRukuhOptions;
      if (!options.length) return null;
      const idx = options.findIndex(
        (o) =>
          String(data.forms.juz.rukuhNumber) === getJuzRukuhOptionValue(o) ||
          String(o.juzRukuh) === String(data.forms.juz.rukuhNumber),
      );
      if (idx < 0) return null;
      if (options.length === 1) return 1;
      return (idx + 1) / options.length;
    }

    return null;
  })();

  const getLatestSavedJuzPayload = (juzNumber) => {
    const target = String(juzNumber);
    return (
      data.history.find(
        (e) => e.mode === "juz" && String(e.payload?.juzNumber) === target,
      )?.payload || null
    );
  };

  const applyJuzSavedSelection = (juzNumber) => {
    const savedPayload = getLatestSavedJuzPayload(juzNumber);
    if (!savedPayload || !savedPayload.selectionType) {
      return { selectionType: "portion", portion: "start", rukuhNumber: "" };
    }
    if (savedPayload.selectionType === "rukuh") {
      return {
        selectionType: "rukuh",
        rukuhNumber: savedPayload.rukuhNumber || "",
        portion: "",
      };
    }
    if (savedPayload.selectionType === "portion") {
      return {
        selectionType: "portion",
        portion: savedPayload.portion || "",
        rukuhNumber: "",
      };
    }
    return null;
  };

  const setJuzQuick = (juzNumber) => {
    const prefill = applyJuzSavedSelection(juzNumber);
    setData((prev) => ({
      ...prev,
      forms: {
        ...prev.forms,
        juz: {
          ...prev.forms.juz,
          juzNumber: String(juzNumber),
          selectionType: prefill?.selectionType || "portion",
          rukuhNumber: prefill?.rukuhNumber || "",
          portion: prefill?.portion || "start",
        },
      },
    }));
  };

  const setFormState = (updater) => {
    setData((prev) => ({
      ...prev,
      forms:
        typeof updater === "function"
          ? updater(prev.forms)
          : { ...prev.forms, ...updater },
    }));
  };

  return (
    <>
      <main className="mx-auto w-full max-w-[720px] px-4 py-8 sm:py-12 space-y-4">
        <header className="flex items-start gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Progress Tracker
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              A calm way to remember where you paused, so you can continue with
              ease.
            </p>
          </div>
        </header>

        <div className="h-px bg-border" />

        <ContinueReadingCard
          latestProgress={{ isReady, latestSurah, latestJuz }}
          formatSurahProgress={formatSurahProgress}
          formatJuzProgress={formatJuzProgress}
        />

        <div className="space-y-4">
          <div className="max-w-md mx-auto scale-[0.97]">
            <SegmentedControl
              ariaLabel="Tracking mode"
              options={[
                { value: "juz", label: "By Juz" },
                { value: "surah", label: "By Surah" },
              ]}
              value={data.activeMode}
              onChange={(next) =>
                setData((prev) => ({ ...prev, activeMode: next }))
              }
            />
          </div>

          <ProgressForm
            mode={data.activeMode}
            formState={data.forms}
            setFormState={setFormState}
            onSave={saveProgress}
            onReset={resetCurrentMode}
            error={error}
            message={message}
            juzOptions={juzOptions}
            currentRukuhOptions={currentRukuhOptions}
            formatRukuhPair={formatRukuhPair}
            getJuzRukuhOptionValue={getJuzRukuhOptionValue}
            juzCompletion={juzCompletion}
            latestProgress={{ latestJuzNumberInt, prevJuz, nextJuz }}
            selectedJuzNumberInt={selectedJuzNumberInt}
            onSelectJuz={setJuzQuick}
            applyJuzSavedSelection={applyJuzSavedSelection}
            surahOptions={surahOptions}
            surahMetaByNumber={surahMetaByNumber}
            selectedSurahRukuhOptions={selectedSurahRukuhOptions}
            ayahOptions={ayahOptions}
            juzForSelectedAyah={juzForSelectedAyah}
            juzForSelectedSurahRukuh={juzForSelectedSurahRukuh}
          />

          <HistoryPanel
            history={recentHistory}
            formatJuzProgress={formatJuzProgress}
            formatSurahProgress={formatSurahProgress}
            onClearHistory={clearHistory}
          />
        </div>
      </main>
    </>
  );
}
