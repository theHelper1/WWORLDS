"use client";

import { useState, useTransition } from "react";
import { hireVendorAction, startConversationAction } from "@/lib/actions";
import type { VendorPackage } from "@/lib/ranking";
import { formatUsd } from "@/lib/utils";

export function VendorActions({
  vendorUserId,
  packages,
}: {
  vendorUserId: string;
  packages: VendorPackage[];
}) {
  const [selected, setSelected] = useState(packages[0]?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {packages.length > 0 ? (
        <div className="space-y-2">
          {packages.map((pkg) => (
            <label
              key={pkg.name}
              className={`block cursor-pointer rounded-2xl p-4 ring-1 transition ${
                selected === pkg.name ? "bg-ivory ring-ink" : "bg-ivory/40 ring-ink/10"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name="package"
                value={pkg.name}
                checked={selected === pkg.name}
                onChange={() => setSelected(pkg.name)}
              />
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{pkg.name}</p>
                <p className="font-serif text-xl">{formatUsd(pkg.price)}</p>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{pkg.description}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-gold">
                {pkg.depositPercent}% deposit · vendor pays 2.9% rail fee
              </p>
            </label>
          ))}
        </div>
      ) : null}
      {error ? <p className="text-sm text-blush-deep">{error}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await hireVendorAction(vendorUserId, selected);
              if (result && "error" in result) setError(result.error ?? "Could not hire this vendor.");
            })
          }
          className="flex-1 rounded-full bg-ink px-5 py-3 text-sm text-ivory disabled:opacity-60"
        >
          Hire & send contract
        </button>
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await startConversationAction(vendorUserId);
              if (result && "error" in result) setError(result.error ?? "Could not start a conversation.");
            })
          }
          className="flex-1 rounded-full border border-ink/15 bg-paper px-5 py-3 text-sm disabled:opacity-60"
        >
          Message
        </button>
      </div>
    </div>
  );
}
