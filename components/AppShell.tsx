"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Store,
  MessageCircle,
  FileSignature,
  Wallet,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const coupleNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/contracts", label: "Contracts", icon: FileSignature },
  { href: "/pay", label: "Payments", icon: Wallet },
];

const vendorNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/contracts", label: "Contracts", icon: FileSignature },
  { href: "/earnings", label: "Earnings", icon: Wallet },
];

export function AppShell({
  user,
  unread,
  children,
}: {
  user: SessionUser;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = user.role === "VENDOR" ? vendorNav : coupleNav;

  return (
    <div className="min-h-screen bg-ivory">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink/10 bg-paper/80 px-5 py-6 backdrop-blur-sm lg:flex">
        <Link href="/dashboard" className="px-2">
          <p className="text-[11px] tracking-[0.35em] uppercase text-gold">Wedding worlds</p>
          <h1 className="font-serif text-3xl tracking-tight">WWORLDS</h1>
        </Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition",
                  active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-ivory-deep/80 hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.href === "/messages" && unread > 0 ? (
                  <span className="ml-auto rounded-full bg-blush px-2 py-0.5 text-[11px] text-white">
                    {unread}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-3xl bg-ivory-deep/70 p-4">
          <div className="flex items-center gap-2 text-sage-deep">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.2em]">Instant Rail</p>
          </div>
          <p className="mt-2 font-serif text-xl leading-tight">Couples pay $0 extra</p>
          <p className="mt-1 text-xs text-ink-soft">USD → XRP → USD. Vendors cover 2.9%.</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-ivory/85 px-4 py-3 backdrop-blur-md sm:px-8">
          <div className="lg:hidden">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">WWORLDS</p>
            <p className="font-serif text-xl">{user.role === "VENDOR" ? "Vendor studio" : "Your wedding"}</p>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm text-ink-soft">
              Signed in as <span className="text-ink">{user.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blush/30 font-serif">
                {user.name.slice(0, 1)}
              </div>
            )}
            <form action={logoutAction}>
              <button className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink-soft hover:bg-paper">
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </form>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-ink/10 px-4 py-2 lg:hidden">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs",
                  active ? "bg-ink text-ivory" : "bg-paper text-ink-soft",
                )}
              >
                {item.label}
                {item.href === "/messages" && unread > 0 ? ` · ${unread}` : ""}
              </Link>
            );
          })}
        </nav>

        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
