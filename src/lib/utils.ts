import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  // Handle special cases
  if (!date || date === "Open" || date === "") {
    return "Open";
  }
  
  // If it's a description like "Proposals accepted anytime", return as-is
  if (date.length > 15 && !date.match(/^\d{4}-\d{2}-\d{2}/)) {
    return date;
  }
  
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return date; // Return original if invalid
    }
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}