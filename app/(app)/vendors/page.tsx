import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VendorCard } from "@/components/VendorCard";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { rankVendors } from "@/lib/ranking";
import { PaymentStatus, VendorCategory } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const user = await requireUser();
  if (user.role === "VENDOR") redirect("/dashboard");
  const { q, category } = await searchParams;
  const selected = category && category in CATEGORY_LABELS ? (category as VendorCategory) : undefined;

  const couple = await prisma.coupleProfile.findUnique({ where: { userId: user.id } });
  const paid = await prisma.payment.aggregate({
    where: { status: PaymentStatus.PAID, contract: { coupleUserId: user.id } },
    _sum: { fiatAmount: true },
  });
  const remaining = (couple?.budget ?? 0) - (paid._sum.fiatAmount ?? 0);

  const vendors = await prisma.vendorProfile.findMany({
    where: {
      ...(selected ? { category: selected } : {}),
      ...(q
        ? {
            OR: [
              { businessName: { contains: q } },
              { city: { contains: q } },
              { bio: { contains: q } },
            ],
          }
        : {}),
    },
  });

  const ranked = rankVendors(vendors, couple, remaining);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Marketplace</p>
      <h1 className="font-serif text-5xl">Find the best vendors</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Ranked for your city, reviews, and remaining budget. Hire in one tap — contracts and Instant Rail
        payments follow.
      </p>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, city, or style"
          className="flex-1 rounded-full bg-paper px-5 py-3 ring-1 ring-ink/10 outline-none"
        />
        <button className="rounded-full bg-ink px-5 py-3 text-sm text-ivory">Search</button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/vendors"
          className={`rounded-full px-4 py-1.5 text-sm ${!selected ? "bg-ink text-ivory" : "bg-paper"}`}
        >
          All
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item}
            href={`/vendors?category=${item}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm ${
              selected === item ? "bg-ink text-ivory" : "bg-paper"
            }`}
          >
            {CATEGORY_LABELS[item]}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            featured={index === 0 && !selected && !q}
          />
        ))}
      </div>
    </div>
  );
}
