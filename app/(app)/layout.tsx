import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const unreadWhere =
    user.role === "COUPLE"
      ? { coupleUserId: user.id, coupleUnread: { gt: 0 } }
      : { vendorUserId: user.id, vendorUnread: { gt: 0 } };

  const unreadConversations = await prisma.conversation.count({ where: unreadWhere });

  return (
    <AppShell user={user} unread={unreadConversations}>
      {children}
    </AppShell>
  );
}
