import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { relativeTime } from "@/lib/utils";

export default async function MessagesIndexPage() {
  const user = await requireUser();
  const conversations = await prisma.conversation.findMany({
    where: user.role === "COUPLE" ? { coupleUserId: user.id } : { vendorUserId: user.id },
    include: {
      couple: true,
      vendor: { include: { vendorProfile: true } },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-5xl">Messages</h1>
      <p className="mt-2 text-ink-soft">Live threads with contracts and Instant Rail receipts attached.</p>
      <ul className="mt-8 space-y-3">
        {conversations.map((conversation) => {
          const other =
            user.role === "COUPLE"
              ? conversation.vendor.vendorProfile?.businessName ?? conversation.vendor.name
              : conversation.couple.name;
          const unread = user.role === "COUPLE" ? conversation.coupleUnread : conversation.vendorUnread;
          const avatar =
            user.role === "COUPLE" ? conversation.vendor.avatarUrl : conversation.couple.avatarUrl;
          return (
            <li key={conversation.id}>
              <Link
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-4 rounded-[24px] bg-paper p-4 ring-1 ring-ink/5"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-ivory-deep" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-serif text-2xl">{other}</p>
                    <p className="text-xs text-ink-soft">{relativeTime(conversation.lastMessageAt)}</p>
                  </div>
                  <p className="truncate text-sm text-ink-soft">{conversation.lastPreview}</p>
                </div>
                {unread > 0 ? (
                  <span className="rounded-full bg-blush px-2 py-0.5 text-xs text-white">{unread}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
