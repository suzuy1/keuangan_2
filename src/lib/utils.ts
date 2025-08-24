import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Car,
  Home,
  Landmark,
  Lightbulb,
  Receipt,
  ShoppingBag,
  Ticket,
  UtensilsCrossed,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";
import type { Transaction } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryIcon(category: string): LucideIcon {
  switch (category.toLowerCase()) {
    case "food":
      return UtensilsCrossed;
    case "transportation":
      return Car;
    case "entertainment":
      return Ticket;
    case "income":
      return Landmark;
    case "utilities":
      return Lightbulb;
    case "rent":
      return Home;
    case "bills":
      return Receipt;
    case "shopping":
      return ShoppingBag;
    default:
      return CircleDollarSign;
  }
}

export function exportToCsv(transactions: Transaction[], filename: string) {
  if (typeof window === "undefined") {
    return;
  }
  
  const header = ['ID', 'Date', 'Description', 'Amount', 'Type', 'Category'];
  const rows = transactions.map(t => 
    [t.id, t.date, `"${t.description.replace(/"/g, '""')}"`, t.amount, t.type, t.category]
  );
  
  const csvContent = [header.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
