import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatUsd } from "@/lib/utils";
import { Stars } from "@/components/Stars";
import { VendorActions } from "@/components/VendorActions";
import type { VendorPackage, VendorReview } from "@/lib/ranking";
import { MapPin } from "lucide-react";

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (user.role === "VENDOR") redirect("/dashboard");
  const { id } = await params;
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: id },
    include: { user: true },
  });
  if (!vendor) notFound();

  const packages = vendor.packages as VendorPackage[];
  const reviews = vendor.reviews as VendorReview[];
  const portfolio = vendor.portfolio as string[];
  const tags = vendor.tags as string[];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-[36px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vendor.coverUrl} alt="" className="h-[380px] w-full object-cover" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{CATEGORY_LABELS[vendor.category]}</p>
          <h1 className="font-serif text-5xl">{vendor.businessName}</h1>
          <p className="mt-2 flex items-center gap-2 text-ink-soft">
            <MapPin className="h-4 w-4" /> {vendor.city} · {vendor.user.name}
          </p>
          <div className="mt-3">
            <Stars rating={vendor.rating} size="md" />
            <span className="ml-2 text-sm text-ink-soft">{vendor.reviewCount} reviews</span>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{vendor.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-paper px-3 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {portfolio.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-56 w-full rounded-[24px] object-cover" />
            ))}
          </div>

          <div className="mt-10 space-y-4">
            <h2 className="font-serif text-3xl">Reviews</h2>
            {reviews.map((review) => (
              <blockquote key={review.author} className="rounded-[24px] bg-paper p-5">
                <Stars rating={review.rating} />
                <p className="mt-2 text-ink-soft">“{review.text}”</p>
                <footer className="mt-2 text-sm">{review.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-[32px] bg-paper p-6 ring-1 ring-ink/5">
          <p className="text-sm text-ink-soft">Starting at</p>
          <p className="font-serif text-4xl">{formatUsd(vendor.startingPrice)}</p>
          <p className="mt-2 text-xs text-ink-soft">
            Hire sends a contract. You pay the listed fiat amount; the vendor covers the 2.9% XRP rail fee.
          </p>
          <div className="mt-6">
            <VendorActions vendorUserId={vendor.userId} packages={packages} />
          </div>
        </aside>
      </div>
    </div>
  );
}
