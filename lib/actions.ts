"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ContractStatus, MessageKind, PaymentStatus, RailStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { clearSession, loginWithPassword, requireUser } from "./auth";
import { quotePayment, randomXrplHash, splitContractPayments } from "./payments";
import type { VendorPackage } from "./ranking";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await loginWithPassword(email, password);
  if ("error" in result) {
    redirect("/login?error=1");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

async function touchConversation(
  conversationId: string,
  preview: string,
  recipient: "couple" | "vendor",
) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastPreview: preview.slice(0, 140),
      ...(recipient === "couple"
        ? { coupleUnread: { increment: 1 } }
        : { vendorUnread: { increment: 1 } }),
    },
  });
}

export async function ensureConversation(vendorUserId: string) {
  const user = await requireUser();
  if (user.role !== "COUPLE") return { error: "Only couples can start a conversation." };

  const vendor = await prisma.user.findUnique({
    where: { id: vendorUserId },
    include: { vendorProfile: true },
  });
  if (!vendor?.vendorProfile) return { error: "Vendor not found." };

  const conversation = await prisma.conversation.upsert({
    where: {
      coupleUserId_vendorUserId: {
        coupleUserId: user.id,
        vendorUserId,
      },
    },
    update: {},
    create: {
      coupleUserId: user.id,
      vendorUserId,
      lastPreview: `Inquiry with ${vendor.vendorProfile.businessName}`,
    },
  });

  return { conversationId: conversation.id };
}

export async function startConversationAction(vendorUserId: string) {
  const result = await ensureConversation(vendorUserId);
  if ("error" in result) return result;
  redirect(`/messages/${result.conversationId}`);
}

export async function sendMessageAction(conversationId: string, formData: FormData) {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Message cannot be empty." };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) return { error: "Conversation not found." };
  if (conversation.coupleUserId !== user.id && conversation.vendorUserId !== user.id) {
    return { error: "Not allowed." };
  }

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      body,
      kind: MessageKind.TEXT,
    },
  });

  const recipient = user.id === conversation.coupleUserId ? "vendor" : "couple";
  await touchConversation(conversationId, body, recipient);
  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true as const };
}

export async function markConversationRead(conversationId: string) {
  const user = await requireUser();
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) return;
  if (conversation.coupleUserId === user.id) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { coupleUnread: 0 },
    });
  } else if (conversation.vendorUserId === user.id) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { vendorUnread: 0 },
    });
  }
  revalidatePath("/messages");
}

export async function hireVendorAction(vendorUserId: string, packageName?: string) {
  const user = await requireUser();
  if (user.role !== "COUPLE") return { error: "Only couples can hire vendors." };

  const vendor = await prisma.user.findUnique({
    where: { id: vendorUserId },
    include: { vendorProfile: true },
  });
  if (!vendor?.vendorProfile) return { error: "Vendor not found." };

  const convo = await ensureConversation(vendorUserId);
  if ("error" in convo) return convo;

  const packages = vendor.vendorProfile.packages as VendorPackage[];
  const selected =
    packages.find((p) => p.name === packageName) ?? packages[0] ?? {
      name: "Booking",
      price: vendor.vendorProfile.startingPrice,
      depositPercent: 30,
      description: vendor.vendorProfile.bio,
    };

  const existing = await prisma.contract.findFirst({
    where: {
      conversationId: convo.conversationId,
      title: selected.name,
      status: { not: ContractStatus.COMPLETED },
    },
  });
  if (existing) {
    redirect(`/contracts/${existing.id}`);
  }

  const contract = await prisma.contract.create({
    data: {
      conversationId: convo.conversationId,
      coupleUserId: user.id,
      vendorUserId,
      title: selected.name,
      terms: buildTerms({
        vendorName: vendor.vendorProfile.businessName,
        coupleName: user.name,
        title: selected.name,
        description: selected.description,
        amount: selected.price,
        depositPercent: selected.depositPercent,
      }),
      amount: selected.price,
      depositPercent: selected.depositPercent,
      status: ContractStatus.SENT,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: convo.conversationId,
      senderId: vendorUserId,
      body: `Contract sent: ${selected.name} · ${formatPlain(selected.price)}`,
      kind: MessageKind.CONTRACT,
      contractId: contract.id,
    },
  });
  await touchConversation(
    convo.conversationId,
    `Contract sent: ${selected.name}`,
    "couple",
  );

  revalidatePath("/contracts");
  revalidatePath("/dashboard");
  redirect(`/contracts/${contract.id}`);
}

function formatPlain(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function buildTerms(opts: {
  vendorName: string;
  coupleName: string;
  title: string;
  description: string;
  amount: number;
  depositPercent: number;
}) {
  return [
    `This services agreement is between ${opts.vendorName} (“Vendor”) and ${opts.coupleName} (“Couple”).`,
    `Scope: ${opts.title}. ${opts.description}`,
    `Total fee: ${formatPlain(opts.amount)}. A ${opts.depositPercent}% deposit is due upon signing. The remaining balance is due 14 days before the event.`,
    `Payment is settled on the WWORLDS Instant Rail (USD → XRP → USD). The couple pays the listed fiat amount with no added processing fee. The vendor pays a 2.9% Instant Rail fee, deducted from the payout.`,
    `Cancellation: deposit is refundable if cancelled in writing more than 90 days before the wedding date, less any non-recoverable third-party costs.`,
    `This demo contract is for product illustration only and is not legal advice.`,
  ].join("\n\n");
}

export async function createContractAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.role !== "VENDOR") redirect("/contracts");

  const conversationId = String(formData.get("conversationId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const terms = String(formData.get("terms") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const depositPercent = Number(formData.get("depositPercent") || 30);

  if (!conversationId || !title || !terms || Number.isNaN(amount) || amount <= 0) {
    redirect("/contracts/new?error=1");
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation || conversation.vendorUserId !== user.id) {
    redirect("/contracts/new?error=1");
  }

  const contract = await prisma.contract.create({
    data: {
      conversationId,
      coupleUserId: conversation.coupleUserId,
      vendorUserId: user.id,
      title,
      terms,
      amount,
      depositPercent,
      status: ContractStatus.SENT,
    },
  });

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      body: `Contract sent: ${title} · ${formatPlain(amount)}`,
      kind: MessageKind.CONTRACT,
      contractId: contract.id,
    },
  });
  await touchConversation(conversationId, `Contract sent: ${title}`, "couple");

  revalidatePath("/contracts");
  revalidatePath("/messages");
  redirect(`/contracts/${contract.id}`);
}

export async function signContractAction(contractId: string, typedName: string, imageData: string) {
  const user = await requireUser();
  if (user.role !== "COUPLE") return { error: "Only the couple can sign this contract." };
  if (!typedName.trim() || !imageData) return { error: "Add your typed name and signature." };

  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract || contract.coupleUserId !== user.id) return { error: "Contract not found." };
  if (contract.status !== ContractStatus.SENT) return { error: "This contract is not awaiting signature." };

  const { deposit, balance } = splitContractPayments(contract.amount, contract.depositPercent);
  const depositQuote = quotePayment(deposit);
  const balanceQuote = quotePayment(balance);

  await prisma.$transaction([
    prisma.signature.create({
      data: {
        contractId,
        userId: user.id,
        typedName: typedName.trim(),
        imageData,
      },
    }),
    prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.SIGNED, signedAt: new Date() },
    }),
    prisma.payment.create({
      data: {
        contractId,
        kind: "DEPOSIT",
        ...depositQuote,
      },
    }),
    prisma.payment.create({
      data: {
        contractId,
        kind: "BALANCE",
        ...balanceQuote,
      },
    }),
    prisma.message.create({
      data: {
        conversationId: contract.conversationId,
        senderId: user.id,
        body: `${user.name} signed “${contract.title}”. Deposit of ${formatPlain(deposit)} is ready on Instant Rail.`,
        kind: MessageKind.CONTRACT,
        contractId,
      },
    }),
    prisma.conversation.update({
      where: { id: contract.conversationId },
      data: {
        lastMessageAt: new Date(),
        lastPreview: `Signed: ${contract.title}`,
        vendorUnread: { increment: 1 },
      },
    }),
  ]);

  revalidatePath("/contracts");
  revalidatePath("/dashboard");
  const depositPayment = await prisma.payment.findFirst({
    where: { contractId, kind: "DEPOSIT" },
  });
  if (depositPayment) redirect(`/pay/${depositPayment.id}`);
  redirect(`/contracts/${contractId}`);
}

export async function settlePaymentAction(paymentId: string) {
  const user = await requireUser();
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { contract: true },
  });
  if (!payment) return { error: "Payment not found." };
  if (payment.contract.coupleUserId !== user.id) return { error: "Only the couple can pay." };
  if (payment.status === PaymentStatus.PAID) return { ok: true as const };

  const quote = quotePayment(payment.fiatAmount);
  const hash = randomXrplHash();
  const now = new Date();

  const sibling = await prisma.payment.findMany({
    where: { contractId: payment.contractId },
  });
  const other = sibling.filter((p) => p.id !== payment.id);
  const otherPaid = other.every((p) => p.status === PaymentStatus.PAID);
  const nextStatus =
    payment.kind === "DEPOSIT" && !otherPaid
      ? ContractStatus.DEPOSIT_PAID
      : otherPaid || payment.kind === "BALANCE"
        ? ContractStatus.COMPLETED
        : ContractStatus.DEPOSIT_PAID;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        ...quote,
        xrplTxHash: hash,
        railStatus: RailStatus.SETTLED,
        status: PaymentStatus.PAID,
        paidAt: now,
      },
    }),
    prisma.contract.update({
      where: { id: payment.contractId },
      data: { status: nextStatus },
    }),
    prisma.message.create({
      data: {
        conversationId: payment.contract.conversationId,
        senderId: user.id,
        body: `Paid ${formatPlain(payment.fiatAmount)} via Instant Rail (XRP). Vendor payout ${formatPlain(quote.vendorPayout)} after 2.9% fee.`,
        kind: MessageKind.PAYMENT,
        paymentId,
        contractId: payment.contractId,
      },
    }),
    prisma.conversation.update({
      where: { id: payment.contract.conversationId },
      data: {
        lastMessageAt: now,
        lastPreview: `Paid ${formatPlain(payment.fiatAmount)} via XRP rail`,
        vendorUnread: { increment: 1 },
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/contracts");
  revalidatePath("/earnings");
  revalidatePath(`/pay/${paymentId}`);
  revalidatePath("/messages");
  return { ok: true as const, xrplTxHash: hash, quote };
}
