import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";
import { SignContractForm } from "@/components/SignContractForm";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      couple: true,
      vendor: { include: { vendorProfile: true } },
      signatures: true,
      payments: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!contract) notFound();
  if (contract.coupleUserId !== user.id && contract.vendorUserId !== user.id) notFound();

  const vendorName = contract.vendor.vendorProfile?.businessName ?? contract.vendor.name;
  const canSign = user.role === "COUPLE" && contract.status === "SENT";

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-[32px] bg-paper p-8 shadow-[0_20px_60px_-40px_rgba(36,30,24,0.6)] ring-1 ring-ink/10">
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-gold">WWORLDS agreement</p>
        <h1 className="mt-4 text-center font-serif text-4xl">{contract.title}</h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          {vendorName} · {contract.couple.name} · {formatUsd(contract.amount)}
        </p>
        <div className="mt-8 space-y-4 whitespace-pre-wrap text-sm leading-7 text-ink-soft">{contract.terms}</div>
        {contract.signatures[0] ? (
          <div className="mt-10 border-t border-ink/10 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Signed</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={contract.signatures[0].imageData} alt="Signature" className="mt-2 h-16" />
            <p className="text-sm">
              {contract.signatures[0].typedName} ·{" "}
              {contract.signedAt?.toLocaleString("en-US")}
            </p>
            {contract.signatures[0].ipAddress ? (
              <p className="mt-1 text-[11px] text-ink-soft">
                Signed from {contract.signatures[0].ipAddress}
              </p>
            ) : null}
          </div>
        ) : null}
      </article>

      <aside className="space-y-5">
        <div className="rounded-[28px] bg-ink p-6 text-ivory">
          <p className="text-[11px] uppercase tracking-[0.2em] text-xrp">Instant Rail</p>
          <p className="mt-2 font-serif text-3xl">Vendor pays 2.9%</p>
          <p className="mt-2 text-sm text-ivory/70">
            Couples settle the listed fiat amount. XRP bridges the payment; the 2.9% processing fee is deducted
            from the vendor payout.
          </p>
        </div>

        {canSign ? <SignContractForm contractId={contract.id} /> : null}

        <div className="rounded-[28px] bg-paper p-6">
          <h2 className="font-serif text-2xl">Payments</h2>
          <ul className="mt-4 space-y-3">
            {contract.payments.map((payment) => (
              <li key={payment.id} className="rounded-2xl bg-ivory p-4">
                <div className="flex justify-between">
                  <p>{payment.kind === "DEPOSIT" ? "Deposit" : "Balance"}</p>
                  <p>{formatUsd(payment.fiatAmount)}</p>
                </div>
                <p className="text-xs text-ink-soft">
                  Vendor receives {formatUsd(payment.vendorPayout)} after {payment.feePercent}% fee
                </p>
                {user.role === "COUPLE" && payment.status !== "PAID" ? (
                  <Link href={`/pay/${payment.id}`} className="mt-2 inline-block text-sm underline">
                    Pay instantly
                  </Link>
                ) : (
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-sage-deep">{payment.status}</p>
                )}
              </li>
            ))}
            {contract.payments.length === 0 ? (
              <p className="text-sm text-ink-soft">Payments appear after the couple signs.</p>
            ) : null}
          </ul>
        </div>
      </aside>
    </div>
  );
}
