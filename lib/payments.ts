import { roundMoney } from "./utils";

/** Vendor-paid Instant Rail processing fee. Couples pay $0 extra. */
export const FEE_PERCENT = 2.9;

/** Demo XRPL spot rate used for the fiat → XRP → fiat bridge. */
export const XRP_USD_RATE = 2.37;

export type PaymentQuote = {
  fiatAmount: number;
  feePercent: number;
  feeAmount: number;
  vendorPayout: number;
  xrpRate: number;
  xrpAmount: number;
};

export function quotePayment(fiatAmount: number, xrpRate = XRP_USD_RATE): PaymentQuote {
  const feeAmount = roundMoney(fiatAmount * (FEE_PERCENT / 100));
  const vendorPayout = roundMoney(fiatAmount - feeAmount);
  const xrpAmount = Math.round((fiatAmount / xrpRate) * 1_000_000) / 1_000_000;
  return {
    fiatAmount: roundMoney(fiatAmount),
    feePercent: FEE_PERCENT,
    feeAmount,
    vendorPayout,
    xrpRate,
    xrpAmount,
  };
}

export function randomXrplHash() {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function splitContractPayments(amount: number, depositPercent: number) {
  const deposit = roundMoney(amount * (depositPercent / 100));
  const balance = roundMoney(amount - deposit);
  return { deposit, balance };
}
