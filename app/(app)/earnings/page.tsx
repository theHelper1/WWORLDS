import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd, formatXrp } from "@/lib/utils";
import { FEE_PERCENT } from "@/lib/payments";

export default async function EarningsPage() {
  const user = await requireUser();
  if (user.role !== "VENDOR") redirect("/pay");

  const payments = await prisma.payment.findMany({
    where: { contract: { vendorUserId: user.id } },
    include: { contract: { include: { couple: true } } },
    orderBy: { createdAt: "desc" },
  });

  const paid = payments.filter((p) => p.status === "PAID");
  const earned = paid.reduce((sum, p) => sum + p.vendorPayout, 0);
  const fees = paid.reduce((sum, p) => sum + p.feeAmount, 0);
  const volume = paid.reduce((sum, p) => sum + p.fiatAmount, 0);
  const xrpVolume = paid.reduce((sum, p) => sum + p.xrpAmount, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-xrp-deep">Payouts</p>
        <h1 className="font-serif text-5xl">Earnings</h1>
        <p className="mt-2 text-ink-soft">
          Instant Rail converts couple USD to XRP, then back to your USD. You pay a {FEE_PERCENT}% processing
          fee so the couple is never surcharged.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[28px] bg-ink p-6 text-ivory">
          <p className="text-xs uppercase tracking-[0.2em] text-ivory/50">Net payouts</p>
          <p className="font-serif text-4xl">{formatUsd(earned)}</p>
        </div>
        <div className="rounded-[28px] bg-paper p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Fees you paid</p>
          <p className="font-serif text-4xl">{formatUsd(fees)}</p>
        </div>
        <div className="rounded-[28px] bg-paper p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">XRP bridged</p>
          <p className="font-serif text-3xl">{formatXrp(xrpVolume)}</p>
          <p className="text-xs text-ink-soft">{formatUsd(volume)} fiat volume</p>
        </div>
      </div>

      <ul className="space-y-3">
        {payments.map((payment) => (
          <li key={payment.id} className="rounded-[24px] bg-paper p-5 ring-1 ring-ink/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-2xl">
                  {payment.contract.couple.name} · {payment.kind === "DEPOSIT" ? "Deposit" : "Balance"}
                </p>
                <p className="text-sm text-ink-soft">{payment.contract.title}</p>
              </div>
              <div className="text-right text-sm">
                <p>Couple paid {formatUsd(payment.fiatAmount)}</p>
                <p className="text-ink-soft">You receive {formatUsd(payment.vendorPayout)}</p>
                <p className="text-xs text-xrp-deep">
                  Fee {formatUsd(payment.feeAmount)} · {payment.status}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
