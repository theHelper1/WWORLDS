import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createContractAction } from "@/lib/actions";

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  if (user.role !== "VENDOR") redirect("/contracts");
  const { error } = await searchParams;

  const conversations = await prisma.conversation.findMany({
    where: { vendorUserId: user.id },
    include: { couple: { include: { coupleProfile: true } } },
    orderBy: { lastMessageAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-serif text-5xl">Send a contract</h1>
      <p className="mt-2 text-ink-soft">
        Couples sign in-app, then pay on Instant Rail. You cover the 2.9% XRP processing fee.
      </p>
      <form action={createContractAction} className="mt-8 space-y-4 rounded-[28px] bg-paper p-6">
        {error ? <p className="text-sm text-blush-deep">Please fill in every field and choose a couple.</p> : null}
        <label className="block text-sm">
          Couple
          <select
            name="conversationId"
            required
            className="mt-1 w-full rounded-2xl bg-ivory px-4 py-3 ring-1 ring-ink/10"
          >
            {conversations.map((conversation) => (
              <option key={conversation.id} value={conversation.id}>
                {conversation.couple.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Title
          <input name="title" required className="mt-1 w-full rounded-2xl bg-ivory px-4 py-3 ring-1 ring-ink/10" />
        </label>
        <label className="block text-sm">
          Amount (USD)
          <input
            name="amount"
            type="number"
            min="1"
            step="0.01"
            required
            className="mt-1 w-full rounded-2xl bg-ivory px-4 py-3 ring-1 ring-ink/10"
          />
        </label>
        <label className="block text-sm">
          Deposit %
          <input
            name="depositPercent"
            type="number"
            min="10"
            max="100"
            defaultValue={30}
            className="mt-1 w-full rounded-2xl bg-ivory px-4 py-3 ring-1 ring-ink/10"
          />
        </label>
        <label className="block text-sm">
          Terms
          <textarea
            name="terms"
            required
            rows={8}
            defaultValue="Scope of work, timeline, and cancellation terms. Payment settles USD → XRP → USD on the WWORLDS Instant Rail. The couple pays the listed fiat amount. The vendor pays a 2.9% processing fee."
            className="mt-1 w-full rounded-2xl bg-ivory px-4 py-3 ring-1 ring-ink/10"
          />
        </label>
        <button className="w-full rounded-full bg-ink py-3 text-ivory">Send to couple</button>
      </form>
    </div>
  );
}
