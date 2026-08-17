import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[36px] bg-paper shadow-[0_40px_80px_-50px_rgba(36,30,24,0.8)] ring-1 ring-ink/10 md:grid-cols-2">
        <div className="relative hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/35" />
          <p className="absolute bottom-8 left-8 font-serif text-4xl text-ivory">
            Emma & James
            <span className="block text-lg text-ivory/80">Napa Valley · May 15, 2027</span>
          </p>
        </div>
        <LoginForm error={Boolean(error)} />
      </div>
    </div>
  );
}
