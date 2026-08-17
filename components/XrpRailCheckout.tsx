"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { settlePaymentAction } from "@/lib/actions";
import { formatUsd, formatXrp } from "@/lib/utils";
import { FEE_PERCENT } from "@/lib/payments";

const STEPS = [
  { key: "onramp", title: "Fiat in", copy: "Collect USD from the couple. No added fee." },
  { key: "bridge", title: "XRP bridge", copy: "Convert to XRP and settle on the XRPL in seconds." },
  { key: "offramp", title: "Fiat out", copy: "Off-ramp to the vendor’s USD payout." },
  { key: "fee", title: "Vendor fee", copy: `${FEE_PERCENT}% Instant Rail fee is deducted from the vendor.` },
] as const;

export function XrpRailCheckout({
  paymentId,
  fiatAmount,
  feeAmount,
  vendorPayout,
  xrpAmount,
  vendorName,
  kind,
}: {
  paymentId: string;
  fiatAmount: number;
  feeAmount: number;
  vendorPayout: number;
  xrpAmount: number;
  vendorName: string;
  kind: "DEPOSIT" | "BALANCE";
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"ready" | "running" | "done">("ready");
  const [step, setStep] = useState(-1);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function pay() {
    setError(null);
    setPhase("running");
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 900));
    }
    startTransition(async () => {
      const result = await settlePaymentAction(paymentId);
      if (result && "error" in result) {
        setError(result.error ?? "Payment could not be settled.");
        setPhase("ready");
        setStep(-1);
        return;
      }
      setHash(result?.xrplTxHash ?? null);
      setPhase("done");
      setTimeout(() => router.push("/dashboard"), 2200);
    });
  }

  return (
    <div className="overflow-hidden rounded-[32px] bg-ink text-ivory shadow-[0_30px_80px_-40px_rgba(36,30,24,0.8)]">
      <div className="border-b border-white/10 px-8 py-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-xrp">WWORLDS Instant Rail</p>
        <h2 className="mt-2 font-serif text-4xl">Pay {kind === "DEPOSIT" ? "deposit" : "balance"} instantly</h2>
        <p className="mt-2 max-w-xl text-sm text-ivory/70">
          Your {formatUsd(fiatAmount)} moves USD → XRP → USD to {vendorName}. You are not charged a processing fee.
          {vendorName} pays {FEE_PERCENT}% ({formatUsd(feeAmount)}) so you keep more of your budget.
        </p>
      </div>

      <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="relative mb-8 flex items-center justify-between gap-2">
            {["USD", "XRP", "USD"].map((label, i) => (
              <div key={`${label}-${i}`} className="flex flex-1 items-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-medium ${
                    phase === "running" && step >= i ? "bg-xrp text-ink rail-pulse" : "bg-white/10"
                  }`}
                >
                  {label}
                </div>
                {i < 2 ? (
                  <div className="relative mx-2 h-px flex-1 overflow-hidden bg-white/15">
                    <div className={`absolute inset-y-0 w-1/2 bg-xrp ${phase === "running" ? "rail-flow" : ""}`} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <ol className="space-y-3">
            {STEPS.map((item, i) => {
              const active = step === i;
              const done = step > i || phase === "done";
              return (
                <li
                  key={item.key}
                  className={`flex gap-3 rounded-2xl px-4 py-3 ${active ? "bg-white/10" : ""}`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      done || active ? "bg-xrp text-ink" : "bg-white/10"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-ivory/60">{item.copy}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-3xl bg-white/5 p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ivory/60">You pay</dt>
              <dd className="font-serif text-2xl">{formatUsd(fiatAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ivory/60">Bridged on XRPL</dt>
              <dd>{formatXrp(xrpAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ivory/60">Vendor receives</dt>
              <dd>{formatUsd(vendorPayout)}</dd>
            </div>
            <div className="flex justify-between text-xrp">
              <dt>Vendor processing fee</dt>
              <dd>
                {FEE_PERCENT}% · {formatUsd(feeAmount)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <dt className="text-ivory/60">Your extra fees</dt>
              <dd className="text-sage">{formatUsd(0)}</dd>
            </div>
          </dl>

          {error ? <p className="mt-4 text-sm text-blush">{error}</p> : null}
          {hash ? (
            <p className="mt-4 break-all font-mono text-[10px] text-ivory/50">XRPL {hash}</p>
          ) : null}

          {phase === "done" ? (
            <p className="mt-6 rounded-2xl bg-sage/30 px-4 py-3 text-sm">Settled. Taking you back to the dashboard.</p>
          ) : (
            <button
              onClick={pay}
              disabled={phase === "running" || pending}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-xrp px-5 py-3 font-medium text-ink transition hover:bg-xrp-deep hover:text-ivory disabled:opacity-60"
            >
              {phase === "running" || pending ? "Settling on XRPL…" : `Pay ${formatUsd(fiatAmount)} instantly`}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
