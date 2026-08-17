import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BudgetRing } from "@/components/BudgetRing";
import { VendorCard } from "@/components/VendorCard";
import { rankVendors, type VendorPackage } from "@/lib/ranking";
import { daysUntil, formatUsd } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import { PaymentStatus } from "@prisma/client";

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "VENDOR") {
    return <VendorDashboard userId={user.id} name={user.name} />;
  }

  const couple = await prisma.user.findUnique({
    where: { id: user.id },
    include: { coupleProfile: true },
  });
  const profile = couple?.coupleProfile;
  if (!profile) return null;

  const [vendors, contracts, conversations, paid] = await Promise.all([
    prisma.vendorProfile.findMany({ include: { user: true } }),
    prisma.contract.findMany({
      where: { coupleUserId: user.id },
      include: { vendor: { include: { vendorProfile: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.conversation.findMany({
      where: { coupleUserId: user.id },
      include: { vendor: { include: { vendorProfile: true } } },
    }),
    prisma.payment.findMany({
      where: { status: PaymentStatus.PAID, contract: { coupleUserId: user.id } },
    }),
  ]);

  const spent = paid.reduce((sum, payment) => sum + payment.fiatAmount, 0);
  const remaining = profile.budget - spent;
  const ranked = rankVendors(
    vendors,
    profile,
    remaining,
  ).slice(0, 3);

  const due = contracts.flatMap((c) => c.payments).filter((p) => p.status !== "PAID");
  const countdown = daysUntil(profile.weddingDate);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-[36px] bg-ink text-ivory">
        <div className="grid gap-8 p-8 md:grid-cols-[1.4fr_0.8fr] md:p-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Your wedding</p>
            <h1 className="mt-2 font-serif text-5xl leading-tight">
              {user.name.split(" ")[0]} & {profile.partnerName.split(" ")[0]}
            </h1>
            <p className="mt-3 text-ivory/70">
              {profile.weddingDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} ·{" "}
              {profile.city} · {profile.guestCount} guests
            </p>
            <p className="mt-6 font-serif text-6xl">{countdown}</p>
            <p className="text-sm uppercase tracking-[0.2em] text-ivory/50">days to go</p>
          </div>
          <div className="flex items-center justify-center rounded-[28px] bg-white/5 p-6">
            <div className="flex items-center gap-6">
              <BudgetRing spent={spent} budget={profile.budget} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ivory/50">Budget</p>
                <p className="font-serif text-3xl">{formatUsd(profile.budget)}</p>
                <p className="mt-2 text-sm text-ivory/70">{formatUsd(spent)} settled on Instant Rail</p>
                <p className="text-sm text-xrp">{formatUsd(remaining)} remaining</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {due.slice(0, 3).map((payment) => (
          <Link
            key={payment.id}
            href={`/pay/${payment.id}`}
            className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 transition hover:-translate-y-0.5"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-xrp-deep">Pay on Instant Rail</p>
            <p className="mt-2 font-serif text-3xl">{formatUsd(payment.fiatAmount)}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {payment.kind === "DEPOSIT" ? "Deposit" : "Balance"} · you pay $0 extra · vendor covers 2.9%
            </p>
          </Link>
        ))}
        {due.length === 0 ? (
          <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 md:col-span-3">
            <p className="font-serif text-2xl">No payments waiting</p>
            <p className="text-sm text-ink-soft">Hire a vendor or sign a contract to settle on the XRP rail.</p>
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Your people</p>
            <h2 className="font-serif text-4xl">Hired & in conversation</h2>
          </div>
          <Link href="/vendors" className="text-sm underline">
            Browse marketplace
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {conversations.map((conversation) => {
            const vendor = conversation.vendor.vendorProfile;
            const contract = contracts.find((c) => c.conversationId === conversation.id);
            if (!vendor) return null;
            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex gap-4 rounded-[24px] bg-paper p-4 ring-1 ring-ink/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={vendor.coverUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                <div>
                  <p className="font-serif text-2xl leading-none">{vendor.businessName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-soft">
                    {CATEGORY_LABELS[vendor.category]}
                  </p>
                  <p className="mt-2 text-xs text-gold">
                    {contract?.status.replaceAll("_", " ") ?? "Inquired"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Recommended</p>
          <h2 className="font-serif text-4xl">Best vendors for this wedding</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ranked.map(({ vendor }, index) => (
            <VendorCard
              key={vendor.id}
              id={vendor.userId}
              name={vendor.businessName}
              category={vendor.category}
              city={vendor.city}
              rating={vendor.rating}
              reviewCount={vendor.reviewCount}
              startingPrice={vendor.startingPrice}
              coverUrl={vendor.coverUrl}
              tags={vendor.tags as string[]}
              featured={index === 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

async function VendorDashboard({ userId, name }: { userId: string; name: string }) {
  const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
  const [conversations, contracts, payments] = await Promise.all([
    prisma.conversation.findMany({
      where: { vendorUserId: userId },
      include: { couple: { include: { coupleProfile: true } } },
      orderBy: { lastMessageAt: "desc" },
    }),
    prisma.contract.findMany({
      where: { vendorUserId: userId },
      include: { couple: true, payments: true },
    }),
    prisma.payment.findMany({
      where: { contract: { vendorUserId: userId }, status: "PAID" },
    }),
  ]);

  const earned = payments.reduce((sum, p) => sum + p.vendorPayout, 0);
  const fees = payments.reduce((sum, p) => sum + p.feeAmount, 0);
  const incoming = contracts.flatMap((c) => c.payments).filter((p) => p.status !== "PAID");
  const packages = (profile?.packages as VendorPackage[] | undefined) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-[36px] bg-ink p-10 text-ivory">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Vendor studio</p>
        <h1 className="mt-2 font-serif text-5xl">{profile?.businessName ?? name}</h1>
        <p className="mt-3 max-w-2xl text-ivory/70">{profile?.bio}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/50">Settled payouts</p>
            <p className="font-serif text-4xl">{formatUsd(earned)}</p>
          </div>
          <div className="rounded-3xl bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/50">Rail fees paid</p>
            <p className="font-serif text-4xl">{formatUsd(fees)}</p>
            <p className="mt-1 text-xs text-xrp">2.9% on Instant Rail</p>
          </div>
          <div className="rounded-3xl bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/50">Awaiting couple</p>
            <p className="font-serif text-4xl">{incoming.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-paper p-6">
          <h2 className="font-serif text-3xl">Inquiries</h2>
          <ul className="mt-4 space-y-3">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link href={`/messages/${conversation.id}`} className="block rounded-2xl bg-ivory p-4">
                  <p className="font-medium">{conversation.couple.name}</p>
                  <p className="text-sm text-ink-soft">{conversation.lastPreview}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] bg-paper p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl">Packages</h2>
            <Link href="/contracts/new" className="text-sm underline">
              Send a contract
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {packages.map((pkg) => (
              <li key={pkg.name} className="rounded-2xl bg-ivory p-4">
                <div className="flex justify-between">
                  <p className="font-medium">{pkg.name}</p>
                  <p>{formatUsd(pkg.price)}</p>
                </div>
                <p className="text-sm text-ink-soft">{pkg.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
