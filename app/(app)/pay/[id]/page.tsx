import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { XrpRailCheckout } from "@/components/XrpRailCheckout";
import { formatUsd, formatXrp } from "@/lib/utils";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { contract: { include: { vendor: { include: { vendorProfile: true } } } } },
  });
  if (!payment) notFound();
  if (payment.contract.coupleUserId !== user.id && payment.contract.vendorUserId !== user.id) notFound();

  const vendorName = payment.contract.vendor.vendorProfile?.businessName ?? payment.contract.vendor.name;

  if (user.role === "VENDOR") {
    redirect("/earnings");
  }

  if (payment.status === "PAID") {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] bg-paper p-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-xrp-deep">Settled</p>
        <h1 className="mt-2 font-serif text-4xl">{formatUsd(payment.fiatAmount)} paid</h1>
        <p className="mt-3 text-ink-soft">
          Bridged {formatXrp(payment.xrpAmount)} on XRPL. {vendorName} received {formatUsd(payment.vendorPayout)}{" "}
          after a {payment.feePercent}% fee of {formatUsd(payment.feeAmount)}.
        </p>
        {payment.xrplTxHash ? (
          <p className="mt-4 break-all font-mono text-[11px] text-ink-soft">XRPL {payment.xrplTxHash}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-4 text-sm text-ink-soft">
        {payment.contract.title} · {vendorName}
      </p>
      <XrpRailCheckout
        paymentId={payment.id}
        fiatAmount={payment.fiatAmount}
        feeAmount={payment.feeAmount}
        vendorPayout={payment.vendorPayout}
        xrpAmount={payment.xrpAmount}
        vendorName={vendorName}
        kind={payment.kind}
      />
    </div>
  );
}
