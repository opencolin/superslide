"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/deck/schema";
import { composeNarration } from "@/lib/narrate/compose";

const KEY_STORAGE = "superslide:elevenlabs-key";

export type ByokSource = "shared" | "user" | null;

export interface NarrationApi {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
  loading: boolean;
  playing: boolean;
  byokRequired: boolean;
  byokReason: string | null;
  byokSource: ByokSource;
  hasUserKey: boolean;
  saveUserKey: (key: string) => void;
  clearUserKey: () => void;
  dismissByok: () => void;
}

/**
 * Drives narration playback for the current slide.
 *
 * Flow:
 *  - toggle(true) → fetch /api/narrate for the current slide, play the
 *    returned MP3, and on `ended` call onAdvance() to roll to the next slide.
 *  - The slide-change effect re-fetches when the slide id changes while
 *    narration is enabled, so the loop continues hands-free.
 *  - Any 401/402 from the API surfaces as `byokRequired = true` with a
 *    human-readable reason; the consumer renders a dialog that calls
 *    saveUserKey on submit.
 *  - The user's key is kept only in localStorage and sent in the
 *    x-elevenlabs-key header on subsequent requests.
 */
export function useNarration(opts: {
  slide: Slide;
  onAdvance: () => void;
  canAdvance: boolean;
}): NarrationApi {
  const { slide, onAdvance, canAdvance } = opts;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastObjectUrl = useRef<string | null>(null);
  const enabledRef = useRef(false);
  const advanceRef = useRef(onAdvance);
  const canAdvanceRef = useRef(canAdvance);

  advanceRef.current = onAdvance;
  canAdvanceRef.current = canAdvance;

  const [enabled, setEnabledState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [byokRequired, setByokRequired] = useState(false);
  const [byokReason, setByokReason] = useState<string | null>(null);
  const [byokSource, setByokSource] = useState<ByokSource>(null);
  const [userKey, setUserKey] = useState<string | null>(null);

  // Lazy localStorage read after mount to avoid SSR mismatch.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY_STORAGE);
      if (stored) setUserKey(stored);
    } catch {}
  }, []);

  const stopAudio = useCallback(() => {
    abortRef.current?.abort();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (lastObjectUrl.current) {
      URL.revokeObjectURL(lastObjectUrl.current);
      lastObjectUrl.current = null;
    }
    setPlaying(false);
    setLoading(false);
  }, []);

  const setEnabled = useCallback(
    (v: boolean) => {
      enabledRef.current = v;
      setEnabledState(v);
      if (!v) stopAudio();
    },
    [stopAudio],
  );

  const toggle = useCallback(() => setEnabled(!enabledRef.current), [setEnabled]);

  const saveUserKey = useCallback((key: string) => {
    try {
      localStorage.setItem(KEY_STORAGE, key);
    } catch {}
    setUserKey(key);
    setByokRequired(false);
    setByokReason(null);
    setByokSource(null);
  }, []);

  const clearUserKey = useCallback(() => {
    try {
      localStorage.removeItem(KEY_STORAGE);
    } catch {}
    setUserKey(null);
  }, []);

  const dismissByok = useCallback(() => {
    setByokRequired(false);
    setByokReason(null);
    setByokSource(null);
  }, []);

  const fetchAndPlay = useCallback(async () => {
    stopAudio();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);

    const text = composeNarration(slide);
    if (!text) {
      setLoading(false);
      // Empty narration → skip ahead so the loop doesn't stall.
      if (enabledRef.current && canAdvanceRef.current) advanceRef.current();
      return;
    }

    try {
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (userKey) headers["x-elevenlabs-key"] = userKey;
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers,
        body: JSON.stringify({ text }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 402) {
          setByokRequired(true);
          setByokReason(errBody.message ?? "ElevenLabs key required.");
          setByokSource(errBody.source ?? "shared");
          setLoading(false);
          // Pause the loop but keep the toggle visually on — once the user
          // saves a key we can resume from where we left off.
          enabledRef.current = false;
          setEnabledState(false);
          return;
        }
        throw new Error(errBody.message ?? `Narration failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      lastObjectUrl.current = url;

      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audioRef.current = audio;
      }
      audio.src = url;
      audio.onended = () => {
        setPlaying(false);
        if (enabledRef.current && canAdvanceRef.current) advanceRef.current();
        else if (enabledRef.current && !canAdvanceRef.current) {
          enabledRef.current = false;
          setEnabledState(false);
        }
      };
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onerror = () => {
        setPlaying(false);
        setLoading(false);
      };
      await audio.play();
      setLoading(false);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.warn("[narrate]", err);
      setLoading(false);
    }
  }, [slide, userKey, stopAudio]);

  // Re-fetch + play whenever the active slide changes while enabled.
  useEffect(() => {
    if (!enabled) return;
    fetchAndPlay();
    return () => {
      abortRef.current?.abort();
    };
  }, [enabled, slide.id, fetchAndPlay]);

  // Cleanup on unmount.
  useEffect(
    () => () => {
      stopAudio();
    },
    [stopAudio],
  );

  return {
    enabled,
    toggle,
    setEnabled,
    loading,
    playing,
    byokRequired,
    byokReason,
    byokSource,
    hasUserKey: !!userKey,
    saveUserKey,
    clearUserKey,
    dismissByok,
  };
}
