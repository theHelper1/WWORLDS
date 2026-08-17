import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatThread } from "@/components/ChatThread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      couple: true,
      vendor: { include: { vendorProfile: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) notFound();
  if (conversation.coupleUserId !== user.id && conversation.vendorUserId !== user.id) notFound();

  if (conversation.coupleUserId === user.id && conversation.coupleUnread > 0) {
    await prisma.conversation.update({ where: { id }, data: { coupleUnread: 0 } });
  } else if (conversation.vendorUserId === user.id && conversation.vendorUnread > 0) {
    await prisma.conversation.update({ where: { id }, data: { vendorUnread: 0 } });
  }

  const title =
    user.role === "COUPLE"
      ? conversation.vendor.vendorProfile?.businessName ?? conversation.vendor.name
      : conversation.couple.name;

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Conversation</p>
      <h1 className="mb-4 font-serif text-4xl">{title}</h1>
      <ChatThread
        conversationId={conversation.id}
        currentUserId={user.id}
        initialMessages={conversation.messages.map((message) => ({
          id: message.id,
          body: message.body,
          kind: message.kind,
          senderId: message.senderId,
          createdAt: message.createdAt.toISOString(),
          contractId: message.contractId,
          paymentId: message.paymentId,
          senderName: message.sender.name,
        }))}
      />
    </div>
  );
}
