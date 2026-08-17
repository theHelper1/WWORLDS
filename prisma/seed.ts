import bcrypt from "bcryptjs";
import { PrismaClient, VendorCategory } from "@prisma/client";
import { quotePayment } from "../lib/payments";
import { randomXrplHash } from "../lib/payments";

const prisma = new PrismaClient();

const password = "demo1234";

const photos = {
  emma: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
  sofia: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  venue: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80",
  photo: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  florist: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80",
  catering: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80",
  dj: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80",
  planner: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
  beauty: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1600&q=80",
  cake: "https://images.unsplash.com/photo-1535254973040-607b716d1685?auto=format&fit=crop&w=1600&q=80",
  venue2: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80",
  photo2: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80",
  florist2: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1600&q=80",
  catering2: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
};

type SeedVendor = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  businessName: string;
  category: VendorCategory;
  bio: string;
  city: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  coverUrl: string;
  portfolio: string[];
  packages: { name: string; price: number; depositPercent: number; description: string }[];
  reviews: { author: string; rating: number; text: string }[];
};

const vendors: SeedVendor[] = [
  {
    id: "usr_sofia",
    email: "sofia@lensandvow.app",
    name: "Sofia Chen",
    avatarUrl: photos.sofia,
    businessName: "Lens & Vow",
    category: "PHOTOGRAPHER",
    bio: "Editorial wedding photography with a quiet, film-inspired palette. Sofia photographs the in-between glances as carefully as the processional.",
    city: "Napa",
    startingPrice: 6200,
    rating: 4.97,
    reviewCount: 86,
    tags: ["Editorial", "Film", "Second shooter"],
    coverUrl: photos.photo,
    portfolio: [
      photos.photo,
      "https://images.unsplash.com/photo-1511285560929-80b456fe3ea0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      photos.photo2,
    ],
    packages: [
      {
        name: "Full Day Story",
        price: 8500,
        depositPercent: 30,
        description: "10 hours of coverage, two photographers, a 70-page album, and next-day sneak peeks.",
      },
      {
        name: "Highlights",
        price: 6200,
        depositPercent: 30,
        description: "6 hours of coverage and a digital gallery of 400+ edited images.",
      },
    ],
    reviews: [
      { author: "Maya & Theo", rating: 5, text: "Sofia made us feel completely at ease. The gallery feels like a film we want to rewatch." },
      { author: "Priya R.", rating: 5, text: "Uncanny instinct for light. Guests still talk about how unobtrusive she was." },
    ],
  },
  {
    id: "usr_solenna",
    email: "hello@estatesolenna.app",
    name: "Clara Voss",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    businessName: "Estate Solenna",
    category: "VENUE",
    bio: "A hilltop estate of olive groves, a stone courtyard, and golden-hour terraces overlooking the Napa valley floor.",
    city: "Napa",
    startingPrice: 14000,
    rating: 4.92,
    reviewCount: 41,
    tags: ["Estate", "Outdoor", "Weekend buyout"],
    coverUrl: photos.venue,
    portfolio: [photos.venue, photos.venue2, photos.photo],
    packages: [
      {
        name: "Saturday Estate Buyout",
        price: 18000,
        depositPercent: 25,
        description: "Full grounds, bridal suite, ceremony lawn, and reception courtyard for up to 150 guests.",
      },
    ],
    reviews: [
      { author: "Elena & Mark", rating: 5, text: "The terrace at sunset is the reason we booked. Staff treated our families like their own." },
    ],
  },
  {
    id: "usr_petal",
    email: "studio@petalandstem.app",
    name: "Ivy Moreau",
    avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
    businessName: "Petal & Stem",
    category: "FLORIST",
    bio: "Seasonal, garden-gathered florals. We design as if the bouquet grew wild on the morning of your wedding.",
    city: "Napa",
    startingPrice: 2800,
    rating: 4.89,
    reviewCount: 63,
    tags: ["Garden", "Seasonal", "Installations"],
    coverUrl: photos.florist,
    portfolio: [photos.florist, photos.florist2],
    packages: [
      {
        name: "Ceremony + Reception",
        price: 4200,
        depositPercent: 40,
        description: "Bridal bouquet, party florals, ceremony arch, and three reception tablescapes.",
      },
    ],
    reviews: [
      { author: "Jonah & Will", rating: 5, text: "The arch looked like it had always belonged on that hillside." },
    ],
  },
  {
    id: "usr_hearth",
    email: "events@hearthtable.app",
    name: "Mateo Ruiz",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    businessName: "Hearth Table",
    category: "CATERING",
    bio: "Wood-fired, wine-country menus with family-style service. We cook like a long lunch that happens to be a wedding.",
    city: "Sonoma",
    startingPrice: 95,
    rating: 4.94,
    reviewCount: 58,
    tags: ["Family-style", "Wine country", "Dietary-friendly"],
    coverUrl: photos.catering,
    portfolio: [photos.catering, photos.catering2],
    packages: [
      {
        name: "Harvest Dinner",
        price: 11400,
        depositPercent: 30,
        description: "Passed bites, family-style harvest dinner, and late-night wood-fired pizza for 120 guests.",
      },
    ],
    reviews: [
      { author: "Ava K.", rating: 5, text: "Grandparents and friends from out of town still email us about the lamb." },
    ],
  },
  {
    id: "usr_goldhour",
    email: "book@goldhour.band",
    name: "Nico Hart",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    businessName: "Gold Hour Band",
    category: "DJ",
    bio: "Live band plus DJ hybrid. Ceremony strings, cocktail jazz, and a dance floor that does not empty.",
    city: "San Francisco",
    startingPrice: 3800,
    rating: 4.85,
    reviewCount: 47,
    tags: ["Live band", "MC", "Ceremony"],
    coverUrl: photos.dj,
    portfolio: [photos.dj],
    packages: [
      {
        name: "Full Celebration",
        price: 5400,
        depositPercent: 35,
        description: "Ceremony trio, cocktail set, and five-piece band with DJ encore until midnight.",
      },
    ],
    reviews: [
      { author: "Sam & Riley", rating: 5, text: "They read the room perfectly. Even our quiet uncle danced." },
    ],
  },
  {
    id: "usr_june",
    email: "studio@juneandco.app",
    name: "June Patel",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    businessName: "June & Co.",
    category: "PLANNER",
    bio: "Full-service planning for design-led weddings. We hold the timeline so you can hold each other.",
    city: "Napa",
    startingPrice: 7500,
    rating: 5,
    reviewCount: 29,
    tags: ["Full-service", "Design", "Month-of"],
    coverUrl: photos.planner,
    portfolio: [photos.planner, photos.venue],
    packages: [
      {
        name: "Full Planning",
        price: 9800,
        depositPercent: 30,
        description: "Vendor sourcing, design direction, guest experience, and on-the-day coordination for up to 18 months.",
      },
    ],
    reviews: [
      { author: "Claire B.", rating: 5, text: "June anticipated problems we did not know we had. Effortless from our side." },
    ],
  },
  {
    id: "usr_atelier",
    email: "hello@atelierbeauty.app",
    name: "Lana Brooks",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
    businessName: "Atelier Beauty",
    category: "BEAUTY",
    bio: "Soft-glam hair and makeup that photographs like skin, not product. Trials included with every booking.",
    city: "San Francisco",
    startingPrice: 420,
    rating: 4.9,
    reviewCount: 112,
    tags: ["Soft glam", "Trials", "Party of 6"],
    coverUrl: photos.beauty,
    portfolio: [photos.beauty],
    packages: [
      {
        name: "Couple + Party",
        price: 2100,
        depositPercent: 40,
        description: "Bridal hair and makeup with trial, plus four additional glam appointments on the day.",
      },
    ],
    reviews: [
      { author: "Naomi T.", rating: 5, text: "I looked like myself, just rested and glowing. That was the brief." },
    ],
  },
  {
    id: "usr_sugar",
    email: "orders@sugarorchard.app",
    name: "Bea Hollis",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    businessName: "Sugar Orchard",
    category: "CAKE",
    bio: "Sculptural buttercream cakes flavored like the season: citrus elderflower in spring, stone fruit in late summer.",
    city: "Napa",
    startingPrice: 650,
    rating: 4.88,
    reviewCount: 74,
    tags: ["Buttercream", "Tastings", "Dietary"],
    coverUrl: photos.cake,
    portfolio: [photos.cake],
    packages: [
      {
        name: "Three-Tier Celebration",
        price: 980,
        depositPercent: 50,
        description: "Three-tier cake for 120, plus a cutting cake and late-night cookie crate.",
      },
    ],
    reviews: [
      { author: "Owen & Liv", rating: 5, text: "Beautiful and actually delicious — a rare pairing." },
    ],
  },
  {
    id: "usr_northlight",
    email: "film@northlight.app",
    name: "Owen Park",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    businessName: "Northlight Films",
    category: "PHOTOGRAPHER",
    bio: "Documentary films and stills with a warm, analog grain. We stay for the last song.",
    city: "Oakland",
    startingPrice: 5400,
    rating: 4.83,
    reviewCount: 38,
    tags: ["Film", "Documentary", "Drone"],
    coverUrl: photos.photo2,
    portfolio: [photos.photo2, photos.photo],
    packages: [
      {
        name: "Day-of Film + Stills",
        price: 7200,
        depositPercent: 30,
        description: "Lead filmmaker and photographer, highlight film, and a full digital stills gallery.",
      },
    ],
    reviews: [
      { author: "Harper Q.", rating: 5, text: "The film made our parents cry in the best way." },
    ],
  },
  {
    id: "usr_wilder",
    email: "studio@wilderblooms.app",
    name: "Remy Cole",
    avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80",
    businessName: "Wilder Blooms",
    category: "FLORIST",
    bio: "Sculptural, slightly wild arrangements for modern estates. Lots of movement, very little foam.",
    city: "San Francisco",
    startingPrice: 3200,
    rating: 4.8,
    reviewCount: 22,
    tags: ["Sculptural", "Sustainable"],
    coverUrl: photos.florist2,
    portfolio: [photos.florist2, photos.florist],
    packages: [
      {
        name: "Modern Grounding",
        price: 5100,
        depositPercent: 40,
        description: "Aisle meadows, sweetheart table, and hanging installation over the dance floor.",
      },
    ],
    reviews: [
      { author: "Gia P.", rating: 5, text: "Guests thought the flowers were part of the architecture." },
    ],
  },
  {
    id: "usr_glassbarn",
    email: "stay@theglassbarn.app",
    name: "Helen Cho",
    avatarUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80",
    businessName: "The Glass Barn",
    category: "VENUE",
    bio: "A restored barn with a glass nave, vineyard views, and on-site cottages for the wedding party.",
    city: "Sonoma",
    startingPrice: 11000,
    rating: 4.76,
    reviewCount: 33,
    tags: ["Barn", "Lodging", "Vineyard"],
    coverUrl: photos.venue2,
    portfolio: [photos.venue2, photos.venue],
    packages: [
      {
        name: "Friday-Sunday Takeover",
        price: 15500,
        depositPercent: 25,
        description: "Ceremony nave, reception barn, and six cottages from Friday check-in to Sunday brunch.",
      },
    ],
    reviews: [
      { author: "Chris & Dana", rating: 5, text: "Waking up on the property the next morning was the gift we did not expect." },
    ],
  },
  {
    id: "usr_maison",
    email: "table@maisonpalate.app",
    name: "André Silva",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    businessName: "Maison Palate",
    category: "CATERING",
    bio: "Refined plated dinners with a California-French pantry. Sommelier pairings available.",
    city: "Napa",
    startingPrice: 145,
    rating: 4.91,
    reviewCount: 19,
    tags: ["Plated", "Sommelier", "Luxury"],
    coverUrl: photos.catering2,
    portfolio: [photos.catering2, photos.catering],
    packages: [
      {
        name: "Palate Menu",
        price: 17400,
        depositPercent: 30,
        description: "Four-course plated dinner, champagne welcome, and petit fours for 120 guests.",
      },
    ],
    reviews: [
      { author: "The Alcotts", rating: 5, text: "It tasted like a destination restaurant, served under our oaks." },
    ],
  },
];

async function main() {
  await prisma.payment.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.message.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.coupleProfile.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      id: "usr_emma",
      email: "emma@wworlds.app",
      passwordHash: hash,
      name: "Emma Calder",
      role: "COUPLE",
      avatarUrl: photos.emma,
      coupleProfile: {
        create: {
          partnerName: "James Calder",
          weddingDate: new Date("2027-05-15T16:00:00.000Z"),
          city: "Napa",
          guestCount: 120,
          budget: 65000,
          venueName: "Still deciding",
        },
      },
    },
  });

  for (const vendor of vendors) {
    await prisma.user.create({
      data: {
        id: vendor.id,
        email: vendor.email,
        passwordHash: hash,
        name: vendor.name,
        role: "VENDOR",
        avatarUrl: vendor.avatarUrl,
        vendorProfile: {
          create: {
            businessName: vendor.businessName,
            category: vendor.category,
            bio: vendor.bio,
            city: vendor.city,
            startingPrice: vendor.startingPrice,
            rating: vendor.rating,
            reviewCount: vendor.reviewCount,
            tags: vendor.tags,
            coverUrl: vendor.coverUrl,
            portfolio: vendor.portfolio,
            packages: vendor.packages,
            reviews: vendor.reviews,
          },
        },
      },
    });
  }

  const convoSofia = await prisma.conversation.create({
    data: {
      id: "convo_emma_sofia",
      coupleUserId: "usr_emma",
      vendorUserId: "usr_sofia",
      lastPreview: "Sending the Full Day Story contract now.",
      coupleUnread: 1,
      vendorUnread: 0,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 35),
      messages: {
        create: [
          {
            senderId: "usr_emma",
            body: "Hi Sofia — we loved your Napa gallery. We're getting married May 15, 2027 at a hillside estate (still choosing). Are you free?",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
          },
          {
            senderId: "usr_sofia",
            body: "Emma, congratulations. May 15 is open. I would be honored. I can hold the date with a signed contract and deposit.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
          },
          {
            senderId: "usr_emma",
            body: "Perfect. Could you send the Full Day Story package?",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
          },
          {
            senderId: "usr_sofia",
            body: "Sending the Full Day Story contract now.",
            kind: "CONTRACT",
            contractId: "ct_sofia_full",
            createdAt: new Date(Date.now() - 1000 * 60 * 35),
          },
        ],
      },
    },
  });

  await prisma.contract.create({
    data: {
      id: "ct_sofia_full",
      conversationId: convoSofia.id,
      coupleUserId: "usr_emma",
      vendorUserId: "usr_sofia",
      title: "Full Day Story",
      amount: 8500,
      depositPercent: 30,
      status: "SIGNED",
      signedAt: new Date(Date.now() - 1000 * 60 * 20),
      terms:
        "This services agreement is between Lens & Vow (“Vendor”) and Emma Calder (“Couple”).\n\nScope: Full Day Story. 10 hours of coverage, two photographers, a 70-page album, and next-day sneak peeks.\n\nTotal fee: $8,500.00. A 30% deposit is due upon signing. The remaining balance is due 14 days before the event.\n\nPayment is settled on the WWORLDS Instant Rail (USD → XRP → USD). The couple pays the listed fiat amount with no added processing fee. The vendor pays a 2.9% Instant Rail fee, deducted from the payout.\n\nThis demo contract is for product illustration only and is not legal advice.",
      signatures: {
        create: {
          userId: "usr_emma",
          typedName: "Emma Calder",
          imageData:
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='120'><text x='10' y='80' font-size='48' font-family='cursive' fill='%232A241C'>Emma Calder</text></svg>",
        },
      },
    },
  });

  const deposit = quotePayment(2550);
  const balance = quotePayment(5950);
  await prisma.payment.create({
    data: {
      id: "pay_sofia_deposit",
      contractId: "ct_sofia_full",
      kind: "DEPOSIT",
      ...deposit,
      status: "DUE",
    },
  });
  await prisma.payment.create({
    data: {
      id: "pay_sofia_balance",
      contractId: "ct_sofia_full",
      kind: "BALANCE",
      ...balance,
      status: "DUE",
    },
  });

  const convoVenue = await prisma.conversation.create({
    data: {
      id: "convo_emma_solenna",
      coupleUserId: "usr_emma",
      vendorUserId: "usr_solenna",
      lastPreview: "Please review the Saturday Estate Buyout contract.",
      coupleUnread: 1,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 80),
      messages: {
        create: [
          {
            senderId: "usr_emma",
            body: "We toured yesterday and cannot stop thinking about the terrace. Is May 15, 2027 still available?",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
          },
          {
            senderId: "usr_solenna",
            body: "It is. I'll send the Saturday buyout for 120 guests — you can sign when you're ready.",
            createdAt: new Date(Date.now() - 1000 * 60 * 90),
          },
          {
            senderId: "usr_solenna",
            body: "Please review the Saturday Estate Buyout contract.",
            kind: "CONTRACT",
            contractId: "ct_solenna",
            createdAt: new Date(Date.now() - 1000 * 60 * 80),
          },
        ],
      },
    },
  });

  await prisma.contract.create({
    data: {
      id: "ct_solenna",
      conversationId: convoVenue.id,
      coupleUserId: "usr_emma",
      vendorUserId: "usr_solenna",
      title: "Saturday Estate Buyout",
      amount: 18000,
      depositPercent: 25,
      status: "SENT",
      terms:
        "This services agreement is between Estate Solenna (“Vendor”) and Emma Calder (“Couple”).\n\nScope: Saturday Estate Buyout. Full grounds, bridal suite, ceremony lawn, and reception courtyard for up to 150 guests.\n\nTotal fee: $18,000.00. A 25% deposit is due upon signing.\n\nPayment is settled on the WWORLDS Instant Rail (USD → XRP → USD). The couple pays the listed fiat amount with no added processing fee. The vendor pays a 2.9% Instant Rail fee, deducted from the payout.\n\nThis demo contract is for product illustration only and is not legal advice.",
    },
  });

  await prisma.conversation.create({
    data: {
      id: "convo_emma_petal",
      coupleUserId: "usr_emma",
      vendorUserId: "usr_petal",
      lastPreview: "We work with garden roses, sweet pea, and olive branch that week.",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 12),
      coupleUnread: 1,
      messages: {
        create: [
          {
            senderId: "usr_emma",
            body: "Hello Ivy — we're hoping for something that feels gathered from the estate gardens, not too structured.",
            createdAt: new Date(Date.now() - 1000 * 60 * 50),
          },
          {
            senderId: "usr_petal",
            body: "That is exactly how we work. For mid-May in Napa we lean on garden roses, sweet pea, and olive branch. I can hold a consult Thursday.",
            createdAt: new Date(Date.now() - 1000 * 60 * 12),
          },
        ],
      },
    },
  });

  const settled = quotePayment(980);
  await prisma.conversation.create({
    data: {
      id: "convo_emma_sugar",
      coupleUserId: "usr_emma",
      vendorUserId: "usr_sugar",
      lastPreview: "Paid $980.00 via Instant Rail (XRP).",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  });

  await prisma.contract.create({
    data: {
      id: "ct_sugar",
      conversationId: "convo_emma_sugar",
      coupleUserId: "usr_emma",
      vendorUserId: "usr_sugar",
      title: "Three-Tier Celebration",
      amount: 980,
      depositPercent: 100,
      status: "COMPLETED",
      signedAt: new Date(Date.now() - 1000 * 60 * 60 * 50),
      terms: "Cake tasting and three-tier celebration cake for 120 guests. Paid in full on Instant Rail.",
      payments: {
        create: {
          id: "pay_sugar",
          kind: "DEPOSIT",
          ...settled,
          xrplTxHash: randomXrplHash(),
          railStatus: "SETTLED",
          status: "PAID",
          paidAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        },
      },
    },
  });

  console.log("Seeded WWORLDS demo data.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
