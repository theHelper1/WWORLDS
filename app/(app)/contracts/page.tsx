import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";

export default async function ContractsPage() {
  const user = await requireUser();
  const contracts = await prisma.contract.findMany({
    where: user.role === "COUPLE" ? { coupleUserId: user.id } : { vendorUserId: user.id },
    include: {
      couple: true,
      vendor: { include: { vendorProfile: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Paper</p>
          <h1 className="font-serif text-5xl">Contracts</h1>
        </div>
        {user.role === "VENDOR" ? (
          <Link href="/contracts/new" className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">
            New contract
          </Link>
        ) : null}
      </div>
      <ul className="mt-8 space-y-4">
        {contracts.map((contract) => {
          const due = contract.payments.find((p) => p.status !== "PAID");
          return (
            <li key={contract.id}>
              <Link
                href={`/contracts/${contract.id}`}
                className="block rounded-[28px] bg-paper p-6 ring-1 ring-ink/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-3xl">{contract.title}</p>
                    <p className="text-sm text-ink-soft">
                      {user.role === "COUPLE"
                        ? contract.vendor.vendorProfile?.businessName
                        : contract.couple.name}{" "}
                      · {formatUsd(contract.amount)}
                    </p>
                  </div>
                  <span className="rounded-full bg-ivory-deep px-3 py-1 text-xs uppercase tracking-[0.16em]">
                    {contract.status.replaceAll("_", " ")}
                  </span>
                </div>
                {due ? (
                  <p className="mt-3 text-sm text-xrp-deep">
                    {due.kind === "DEPOSIT" ? "Deposit" : "Balance"} of {formatUsd(due.fiatAmount)} ready on Instant
                    Rail
                  </p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
