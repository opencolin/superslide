"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExternalLink, Key } from "lucide-react";

export function ByokDialog({
  open,
  reason,
  source,
  hasUserKey,
  onSave,
  onClose,
  onClearKey,
}: {
  open: boolean;
  reason: string | null;
  source: "shared" | "user" | null;
  hasUserKey: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  onClearKey: () => void;
}) {
  const [key, setKey] = useState("");

  // Reset the input each time the dialog opens.
  useEffect(() => {
    if (open) setKey("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogTitle className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-fg">
            <Key size={14} strokeWidth={2.5} />
          </span>
          {source === "user" ? "ElevenLabs key issue" : "Bring your ElevenLabs key"}
        </DialogTitle>
        <DialogDescription>
          {reason ??
            "Paste an ElevenLabs API key to enable narration. You can grab one from elevenlabs.io."}
        </DialogDescription>
        <div className="flex flex-col gap-3 pt-4">
          <Input
            type="password"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            placeholder="sk_..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && key.trim()) onSave(key.trim());
            }}
          />
          <p className="text-xs leading-relaxed text-fg-muted">
            Stored in this browser only via <code className="font-mono">localStorage</code>.
            We forward it on per-request narration calls and never persist it
            server-side.
          </p>
        </div>
        <DialogFooter>
          <a
            href="https://elevenlabs.io/app/settings/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
          >
            Get a key <ExternalLink size={12} />
          </a>
          <div className="flex-1" />
          {hasUserKey && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClearKey();
                onClose();
              }}
            >
              Remove saved key
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!key.trim()}
            onClick={() => onSave(key.trim())}
          >
            Save &amp; continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
