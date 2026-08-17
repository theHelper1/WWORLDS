import { VendorCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<VendorCategory, string> = {
  VENUE: "Venue",
  PHOTOGRAPHER: "Photographer",
  FLORIST: "Florist",
  CATERING: "Catering",
  DJ: "DJ / Band",
  PLANNER: "Planner",
  BEAUTY: "Beauty",
  CAKE: "Cake",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as VendorCategory[];

export const DEMO_ACCOUNTS = [
  {
    role: "Couple",
    email: "emma@wworlds.app",
    password: "demo1234",
    blurb: "Emma & James · Napa Valley, May 2027",
  },
  {
    role: "Vendor",
    email: "sofia@lensandvow.app",
    password: "demo1234",
    blurb: "Sofia Chen · Lens & Vow Photography",
  },
] as const;
