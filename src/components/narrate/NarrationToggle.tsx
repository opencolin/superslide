"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Volume2, VolumeX } from "lucide-react";

export function NarrationToggle({
  enabled,
  loading,
  playing,
  onToggle,
}: {
  enabled: boolean;
  loading: boolean;
  playing: boolean;
  onToggle: () => void;
}) {
  const label = enabled ? "Stop narration" : "Narrate slides";
  return (
    <Button
      variant={enabled ? "accent" : "ghost"}
      size="icon"
      onClick={onToggle}
      title={`${label} (N)`}
      aria-label={label}
      aria-pressed={enabled}
      className="relative"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : enabled ? (
        <Volume2 size={18} className={playing ? "animate-pulse" : ""} />
      ) : (
        <VolumeX size={18} />
      )}
    </Button>
  );
}
