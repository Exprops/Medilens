import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This utility function combines Tailwind CSS classes efficiently.

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}