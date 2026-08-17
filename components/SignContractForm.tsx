"use client";

import { useState, useTransition } from "react";
import { SignaturePad } from "./SignaturePad";
import { signContractAction } from "@/lib/actions";

export function SignContractForm({ contractId }: { contractId: string }) {
  const [typedName, setTypedName] = useState("");
  const [imageData, setImageData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <label className="block text-sm">
        Typed legal name
        <input
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          className="mt-1 w-full rounded-2xl bg-ivory px-4 py-3 outline-none ring-1 ring-ink/10"
          placeholder="Emma Calder"
        />
      </label>
      <div>
        <p className="mb-2 text-sm">Draw your signature</p>
        <SignaturePad onChange={setImageData} />
      </div>
      {error ? <p className="text-sm text-blush-deep">{error}</p> : null}
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await signContractAction(contractId, typedName, imageData);
            if (result && "error" in result) setError(result.error ?? "Could not sign this contract.");
          })
        }
        className="w-full rounded-full bg-ink px-5 py-3 text-sm text-ivory disabled:opacity-60"
      >
        {pending ? "Signing…" : "Sign & continue to Instant Pay"}
      </button>
      <p className="text-xs text-ink-soft">
        Demo only. Signing creates a deposit and balance on the XRP Instant Rail. The vendor pays the 2.9%
        processing fee.
      </p>
    </div>
  );
}
