import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", i + 1 <= Math.round(rating) ? "fill-gold" : "fill-transparent")}
        />
      ))}
      <span className="ml-1 text-xs text-ink-soft">{rating.toFixed(2)}</span>
    </span>
  );
}
