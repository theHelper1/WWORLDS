"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { sendMessageAction } from "@/lib/actions";
import { relativeTime } from "@/lib/utils";
import type { MessageKind } from "@prisma/client";

export type ChatMessage = {
  id: string;
  body: string;
  kind: MessageKind;
  senderId: string;
  createdAt: string;
  contractId: string | null;
  paymentId: string | null;
  senderName: string;
};

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [optimistic, addOptimistic] = useOptimistic(messages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [optimistic.length]);

  useEffect(() => {
    const source = new EventSource("/api/messages/stream");
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as ChatMessage & { conversationId?: string };
      if (payload.conversationId && payload.conversationId !== conversationId) return;
      if (!payload.id) return;
      setMessages((current) => (current.some((m) => m.id === payload.id) ? current : [...current, payload]));
    };
    return () => source.close();
  }, [conversationId]);

  async function onSubmit(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;
    const optimisticMsg: ChatMessage = {
      id: `tmp-${Date.now()}`,
      body,
      kind: "TEXT",
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      contractId: null,
      paymentId: null,
      senderName: "You",
    };
    startTransition(async () => {
      addOptimistic((current) => [...current, optimisticMsg]);
      await sendMessageAction(conversationId, formData);
    });
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-[28px] bg-paper ring-1 ring-ink/5">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {optimistic.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm ${
                  message.kind !== "TEXT"
                    ? "bg-ivory-deep text-ink"
                    : mine
                      ? "bg-ink text-ivory"
                      : "bg-ivory text-ink"
                }`}
              >
                {message.kind === "CONTRACT" && message.contractId ? (
                  <Link href={`/contracts/${message.contractId}`} className="block">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Contract</p>
                    <p className="mt-1">{message.body}</p>
                    <p className="mt-2 text-xs underline">Open contract</p>
                  </Link>
                ) : message.kind === "PAYMENT" && message.paymentId ? (
                  <Link href={`/pay/${message.paymentId}`} className="block">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-xrp-deep">Instant Rail</p>
                    <p className="mt-1">{message.body}</p>
                  </Link>
                ) : (
                  <p>{message.body}</p>
                )}
                <p className={`mt-1 text-[10px] ${mine ? "text-ivory/50" : "text-ink-soft"}`}>
                  {relativeTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form action={onSubmit} className="flex gap-2 border-t border-ink/10 p-4">
        <input
          name="body"
          placeholder="Write a message…"
          className="flex-1 rounded-full bg-ivory px-4 py-3 text-sm outline-none ring-1 ring-ink/10 focus:ring-ink/30"
          autoComplete="off"
        />
        <button className="rounded-full bg-ink px-5 py-3 text-sm text-ivory">Send</button>
      </form>
    </div>
  );
}
