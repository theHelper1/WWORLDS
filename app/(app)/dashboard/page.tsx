import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BudgetRing } from "@/components/BudgetRing";
import { VendorCard } from "@/components/VendorCard";
import { rankVendors, type VendorPackage } from "@/lib/ranking";
import { daysUntil, formatUsd } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import { PaymentStatus, type VendorCategory } from "@prisma/client";
import { bookingChip, isBooked } from "@/lib/booking";

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

  const spentByCategory = new Map<VendorCategory, number>();
  for (const contract of contracts) {
    const category = contract.vendor.vendorProfile?.category;
    if (!category) continue;
    const paidAmount = contract.payments
      .filter((payment) => payment.status === PaymentStatus.PAID)
      .reduce((sum, payment) => sum + payment.fiatAmount, 0);
    if (paidAmount > 0) {
      spentByCategory.set(category, (spentByCategory.get(category) ?? 0) + paidAmount);
    }
  }

  const venueBooked = contracts.some(
    (contract) => contract.vendor.vendorProfile?.category === "VENUE" && isBooked(contract.status),
  );
  const unsignedContracts = contracts.filter((contract) => contract.status === "SENT");
  const depositsDue = contracts
    .flatMap((contract) => contract.payments)
    .filter((payment) => payment.kind === "DEPOSIT" && payment.status !== "PAID");

  const checklist = [
    {
      label: "Book a venue",
      done: venueBooked,
      href: venueBooked ? "/contracts" : "/vendors?category=VENUE",
    },
    {
      label: "Sign outstanding contracts",
      done: unsignedContracts.length === 0 && contracts.some((contract) => isBooked(contract.status)),
      href: unsignedContracts[0] ? `/contracts/${unsignedContracts[0].id}` : "/contracts",
    },
    {
      label: "Pay deposits",
      done: depositsDue.length === 0 && spent > 0,
      href: depositsDue[0] ? `/pay/${depositsDue[0].id}` : "/pay",
    },
  ];

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
                {spentByCategory.size > 0 ? (
                  <ul className="mt-3 space-y-1 text-xs text-ivory/60">
                    {[...spentByCategory.entries()].map(([category, amount]) => (
                      <li key={category} className="flex justify-between gap-4">
                        <span>{CATEGORY_LABELS[category]}</span>
                        <span>{formatUsd(amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
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

      <section className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Checklist</p>
        <h2 className="font-serif text-3xl">Keep the day on track</h2>
        <ul className="mt-4 divide-y divide-ink/10">
          {checklist.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="flex items-center justify-between py-3 text-sm">
                <span className={item.done ? "text-ink-soft line-through" : "text-ink"}>{item.label}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-gold">
                  {item.done ? "Done" : "Next"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
                  <p className="mt-2 text-xs text-gold">{bookingChip(contract?.status)}</p>
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
  const unsigned = contracts.filter((contract) => contract.status === "SENT" || contract.status === "DRAFT");
  const portfolio = (profile?.portfolio as string[] | undefined) ?? [];
  const reviews = (profile?.reviews as { author: string }[] | undefined) ?? [];
  const completeness = [
    Boolean(profile?.bio && profile.bio.length > 40),
    Boolean(profile?.coverUrl),
    portfolio.length >= 2,
    packages.length >= 1,
    reviews.length >= 1,
  ];
  const completenessPct = Math.round((completeness.filter(Boolean).length / completeness.length) * 100);

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
        <div className="mt-6 rounded-3xl bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ivory/50">Profile completeness</p>
          <p className="font-serif text-3xl">{completenessPct}%</p>
          <p className="mt-1 text-sm text-ivory/60">
            Bio, cover, gallery, packages, and reviews help couples choose you.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-paper p-6">
          <h2 className="font-serif text-3xl">Unsigned contracts</h2>
          <ul className="mt-4 space-y-3">
            {unsigned.length === 0 ? (
              <li className="text-sm text-ink-soft">No contracts waiting on a signature.</li>
            ) : (
              unsigned.map((contract) => (
                <li key={contract.id}>
                  <Link href={`/contracts/${contract.id}`} className="block rounded-2xl bg-ivory p-4">
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-ink-soft">
                      {contract.couple.name} · {formatUsd(contract.amount)}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-[28px] bg-paper p-6">
          <h2 className="font-serif text-3xl">Upcoming payouts</h2>
          <ul className="mt-4 space-y-3">
            {incoming.length === 0 ? (
              <li className="text-sm text-ink-soft">No Instant Rail payouts waiting.</li>
            ) : (
              incoming.map((payment) => (
                <li key={payment.id} className="rounded-2xl bg-ivory p-4">
                  <p className="font-medium">{formatUsd(payment.vendorPayout)} after 2.9% fee</p>
                  <p className="text-sm text-ink-soft">
                    Couple pays {formatUsd(payment.fiatAmount)} · {payment.kind.toLowerCase()}
                  </p>
                </li>
              ))
            )}
          </ul>
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
