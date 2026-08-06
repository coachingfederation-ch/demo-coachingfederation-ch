/**
 * Shared utility for Tailwind CSS class merging using clsx and tailwind-merge.
 * Exports: cn. Used throughout the application UI.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
