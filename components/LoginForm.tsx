import { loginAction } from "@/lib/actions";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import Link from "next/link";

export function LoginForm({ error }: { error?: boolean }) {
  return (
    <div className="p-8 md:p-10">
      <Link href="/" className="text-[11px] uppercase tracking-[0.3em] text-gold">
        WWORLDS
      </Link>
      <h1 className="mt-3 font-serif text-4xl">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-soft">Use a demo studio below, or sign in with email.</p>

      <div className="mt-6 space-y-3">
        {DEMO_ACCOUNTS.map((account) => (
          <form key={account.email} action={loginAction}>
            <input type="hidden" name="email" value={account.email} />
            <input type="hidden" name="password" value={account.password} />
            <button className="w-full rounded-2xl bg-ivory px-4 py-3 text-left ring-1 ring-ink/10 transition hover:ring-ink/30">
              <p className="text-xs uppercase tracking-[0.18em] text-gold">{account.role}</p>
              <p className="font-medium">{account.email}</p>
              <p className="text-xs text-ink-soft">
                {account.blurb} · password {account.password}
              </p>
            </button>
          </form>
        ))}
      </div>

      <form action={loginAction} className="mt-8 space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-2xl bg-ivory px-4 py-3 ring-1 ring-ink/10 outline-none"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded-2xl bg-ivory px-4 py-3 ring-1 ring-ink/10 outline-none"
        />
        {error ? <p className="text-sm text-blush-deep">Invalid email or password.</p> : null}
        <button className="w-full rounded-full bg-ink py-3 text-ivory">Sign in</button>
      </form>
    </div>
  );
}
