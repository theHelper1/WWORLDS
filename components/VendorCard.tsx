import Link from "next/link";
import { MapPin } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatUsd } from "@/lib/utils";
import { Stars } from "./Stars";
import type { VendorCategory } from "@prisma/client";

export function VendorCard({
  id,
  name,
  category,
  city,
  rating,
  reviewCount,
  startingPrice,
  coverUrl,
  tags,
  featured,
}: {
  id: string;
  name: string;
  category: VendorCategory;
  city: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  coverUrl: string;
  tags: string[];
  featured?: boolean;
}) {
  return (
    <Link
      href={`/vendors/${id}`}
      className="group overflow-hidden rounded-[28px] bg-paper shadow-[0_20px_50px_-30px_rgba(36,30,24,0.45)] ring-1 ring-ink/5 transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
          {CATEGORY_LABELS[category]}
        </span>
        {featured ? (
          <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[11px] text-ivory">
            Best match
          </span>
        ) : null}
        <div className="absolute bottom-4 left-4 right-4 text-ivory">
          <h3 className="font-serif text-3xl leading-none">{name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-ivory/80">
            <MapPin className="h-3.5 w-3.5" /> {city}
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 p-5">
        <div>
          <Stars rating={rating} />
          <p className="mt-1 text-xs text-ink-soft">{reviewCount} reviews</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-ivory-deep px-2 py-0.5 text-[11px] text-ink-soft">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="text-right text-sm text-ink-soft">
          from
          <span className="block font-serif text-2xl text-ink">{formatUsd(startingPrice)}</span>
        </p>
      </div>
    </Link>
  );
}
