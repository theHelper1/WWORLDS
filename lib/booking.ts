import type { ContractStatus } from "@prisma/client";

export function bookingChip(status?: ContractStatus | null) {
  if (!status || status === "DRAFT" || status === "SENT") return "Inquired";
  if (status === "SIGNED") return "Booked";
  return "Paid";
}

export function isBooked(status?: ContractStatus | null) {
  return status === "SIGNED" || status === "DEPOSIT_PAID" || status === "COMPLETED";
}
