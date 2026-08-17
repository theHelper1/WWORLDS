import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function PaymentsIndexPage() {
  const user = await requireUser();
  if (user.role === "VENDOR") redirect("/earnings");

  const payments = await prisma.payment.findMany({
    where: { contract: { coupleUserId: user.id } },
    include: { contract: { include: { vendor: { include: { vendorProfile: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.2em] text-xrp-deep">Instant Rail</p>
      <h1 className="font-serif text-5xl">Payments</h1>
      <p className="mt-2 text-ink-soft">
        Every transfer is USD → XRP → USD. You pay the contract amount. Vendors pay 2.9%.
      </p>
      <ul className="mt-8 space-y-3">
        {payments.map((payment) => (
          <li key={payment.id}>
            <Link
              href={`/pay/${payment.id}`}
              className="flex items-center justify-between rounded-[24px] bg-paper p-5 ring-1 ring-ink/5"
            >
              <div>
                <p className="font-serif text-2xl">
                  {payment.contract.vendor.vendorProfile?.businessName} ·{" "}
                  {payment.kind === "DEPOSIT" ? "Deposit" : "Balance"}
                </p>
                <p className="text-sm text-ink-soft">{payment.contract.title}</p>
              </div>
              <div className="text-right">
                <p>{formatUsd(payment.fiatAmount)}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">{payment.status}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
