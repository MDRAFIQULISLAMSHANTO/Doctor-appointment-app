// Supported currencies for doctor portals. Doctor picks one; patients see it.
export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "BDT" | "INR" | "PKR" | "AED" | "SAR"
  | "CAD" | "AUD" | "NGN" | "ZAR" | "MYR" | "SGD" | "PHP" | "IDR";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "USD", symbol: "$",   label: "US Dollar" },
  { code: "EUR", symbol: "€",   label: "Euro" },
  { code: "GBP", symbol: "£",   label: "British Pound" },
  { code: "BDT", symbol: "৳",   label: "Bangladeshi Taka" },
  { code: "INR", symbol: "₹",   label: "Indian Rupee" },
  { code: "PKR", symbol: "₨",   label: "Pakistani Rupee" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "SAR", symbol: "﷼",   label: "Saudi Riyal" },
  { code: "CAD", symbol: "C$",  label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$",  label: "Australian Dollar" },
  { code: "NGN", symbol: "₦",   label: "Nigerian Naira" },
  { code: "ZAR", symbol: "R",   label: "South African Rand" },
  { code: "MYR", symbol: "RM",  label: "Malaysian Ringgit" },
  { code: "SGD", symbol: "S$",  label: "Singapore Dollar" },
  { code: "PHP", symbol: "₱",   label: "Philippine Peso" },
  { code: "IDR", symbol: "Rp",  label: "Indonesian Rupiah" },
];

const SYMBOLS: Record<string, string> = Object.fromEntries(
  CURRENCIES.map(c => [c.code, c.symbol])
);

/** Symbol for a currency code; falls back to "$" for unknown/empty. */
export function currencySymbol(code?: string | null): string {
  if (!code) return "$";
  return SYMBOLS[code] ?? "$";
}
