import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "CLP"): string {
  if (value == null || isNaN(value)) value = 0;
  if (currency === "CLP") {
    return "$" + Math.round(value).toLocaleString("es-CL");
  }
  const symbol = currency === "USD" ? "US$" : currency === "EUR" ? "€" : "$";
  return symbol + value.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatCompact(value: number): string {
  if (value == null || isNaN(value)) return "$0";
  if (Math.abs(value) >= 1_000_000) return "$" + (value / 1_000_000).toFixed(1) + "M";
  if (Math.abs(value) >= 1_000) return "$" + (value / 1_000).toFixed(0) + "K";
  return "$" + Math.round(value).toLocaleString("es-CL");
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export function uid(): string {
  return (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
