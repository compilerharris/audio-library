"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, HandHeart } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/site";
import { useUiStore } from "@/store/ui-store";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context); nothing to do.
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        {copied ? (
          <Check className="size-3.5 text-gold" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export function DonationModal() {
  const isOpen = useUiStore((s) => s.isDonationOpen);
  const setDonationOpen = useUiStore((s) => s.setDonationOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setDonationOpen}>
      <DialogContent className="border-gold/20 bg-surface p-6 sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
            <HandHeart className="size-6 text-gold" aria-hidden="true" />
          </span>
          <DialogTitle className="font-display text-xl font-semibold text-foreground">
            Support the Library
          </DialogTitle>
          <DialogDescription className="max-w-sm text-sm leading-relaxed">
            {SITE.donation.note}
          </DialogDescription>
        </DialogHeader>

        {/* QR — white quiet zone keeps it scannable on the dark theme */}
        <div className="mx-auto rounded-2xl border border-gold/25 bg-white p-4 shadow-[0_12px_40px_-12px_rgba(200,169,107,0.35)]">
          <QRCodeSVG
            value={SITE.donation.url}
            size={168}
            level="M"
            bgColor="#ffffff"
            fgColor="#0f0b08"
            title={`Donation QR code for ${SITE.name}`}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Scan to donate online, or use the bank details below.
        </p>

        <Separator className="bg-border" />

        <div className="divide-y divide-border/60">
          {SITE.donation.details.map((detail) => (
            <CopyRow
              key={detail.label}
              label={detail.label}
              value={detail.value}
            />
          ))}
        </div>

        <p className="text-center text-xs italic text-muted-foreground">
          May it be a means of ongoing reward for you and your loved ones.
        </p>
      </DialogContent>
    </Dialog>
  );
}
