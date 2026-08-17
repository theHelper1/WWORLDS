import type { CoupleProfile, VendorProfile } from "@prisma/client";

export function rankVendors(
  vendors: VendorProfile[],
  couple: CoupleProfile | null,
  remainingBudget: number,
) {
  return [...vendors]
    .map((vendor) => {
      const ratingScore = vendor.rating * Math.log(1 + vendor.reviewCount);
      const sameCity = couple && vendor.city.toLowerCase() === couple.city.toLowerCase();
      const distancePenalty = sameCity ? 0 : 0.65;
      let budgetFit = 0;
      if (remainingBudget > 0) {
        if (vendor.startingPrice <= remainingBudget * 0.35) budgetFit = 2.2;
        else if (vendor.startingPrice <= remainingBudget) budgetFit = 1.1;
        else budgetFit = -1.4;
      }
      const score = ratingScore + budgetFit - distancePenalty;
      return { vendor, score, sameCity: Boolean(sameCity) };
    })
    .sort((a, b) => b.score - a.score);
}

export type VendorPackage = {
  name: string;
  price: number;
  depositPercent: number;
  description: string;
};

export type VendorReview = {
  author: string;
  rating: number;
  text: string;
};
