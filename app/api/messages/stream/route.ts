import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let lastCheck = new Date(Date.now() - 1000);
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = async () => {
        const messages = await prisma.message.findMany({
          where: {
            createdAt: { gt: lastCheck },
            conversation: {
              OR: [{ coupleUserId: user.id }, { vendorUserId: user.id }],
            },
          },
          include: { sender: true },
          orderBy: { createdAt: "asc" },
        });
        lastCheck = new Date();
        for (const message of messages) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                id: message.id,
                body: message.body,
                kind: message.kind,
                senderId: message.senderId,
                createdAt: message.createdAt.toISOString(),
                contractId: message.contractId,
                paymentId: message.paymentId,
                senderName: message.sender.name,
                conversationId: message.conversationId,
              })}\n\n`,
            ),
          );
        }
      };

      interval = setInterval(() => {
        send().catch(() => undefined);
      }, 1200);
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);
    },
    cancel() {
      if (interval) clearInterval(interval);
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
