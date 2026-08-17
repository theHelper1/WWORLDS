import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles, Store } from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Find the right vendors",
    copy: "A ranked marketplace of venues, florists, photographers, and more — scored for your city, budget, and reviews.",
  },
  {
    icon: MessageCircle,
    title: "Message instantly",
    copy: "Every hire lives in one thread. Contracts and Instant Rail receipts arrive as cards you can open in a tap.",
  },
  {
    icon: Sparkles,
    title: "Pay on the XRP rail",
    copy: "USD → XRP → USD in seconds. Couples pay the listed price. Vendors cover a 2.9% Instant Rail fee.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-[11px] tracking-[0.35em] uppercase text-gold">Wedding worlds</p>
          <p className="font-serif text-3xl leading-none">WWORLDS</p>
        </div>
        <Link href="/login" className="rounded-full bg-ink px-5 py-2.5 text-sm text-ivory">
          Enter the studio
        </Link>
      </header>

      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-20 pt-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-blush-deep">For couples and the people they hire</p>
            <h1 className="mt-4 font-serif text-6xl leading-[0.95] tracking-tight md:text-7xl">
              Plan beautifully.
              <span className="block text-sage-deep">Settle instantly.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              WWORLDS is a wedding studio: discover vendors, talk in real time, sign contracts, and move money
              over XRP so card-network fees never land on the couple.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-ivory"
              >
                Open demo <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#rail" className="rounded-full border border-ink/15 px-6 py-3 text-sm">
                How Instant Rail works
              </a>
            </div>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"
              alt="Wedding portrait"
              className="h-[520px] w-full rounded-[40px] object-cover shadow-[0_40px_80px_-40px_rgba(36,30,24,0.7)]"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-paper/90 p-5 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.22em] text-xrp-deep">Live settlement</p>
              <p className="font-serif text-2xl">USD → XRP → USD in ~4 seconds</p>
              <p className="text-sm text-ink-soft">Couple pays $8,500. Vendor receives $8,253.50. Fee 2.9%.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-[28px] bg-paper p-7 ring-1 ring-ink/5">
            <feature.icon className="h-5 w-5 text-gold" />
            <h2 className="mt-4 font-serif text-3xl">{feature.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{feature.copy}</p>
          </article>
        ))}
      </section>

      <section id="rail" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[36px] bg-ink px-8 py-12 text-ivory md:px-14">
          <p className="text-[11px] uppercase tracking-[0.28em] text-xrp">Instant Payments</p>
          <h2 className="mt-3 max-w-3xl font-serif text-5xl leading-tight">
            Fiat to crypto to fiat, with XRP as the bridge.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Couple pays USD", copy: "The listed contract amount. No 2.9% tacked onto the couple." },
              { step: "02", title: "XRP stable settlement", copy: "Funds convert to XRP and clear on the XRPL in seconds." },
              { step: "03", title: "Vendor receives USD", copy: "Off-ramp to fiat. The vendor pays the 2.9% Instant Rail fee." },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl bg-white/5 p-6">
                <p className="text-xrp">{item.step}</p>
                <h3 className="mt-2 font-serif text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-ivory/70">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
