import { BadgeVariant } from '@/components/ui/badge';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toBadgeVariant = (status: string): BadgeVariant => {
  switch (status.toLowerCase()) {
    case 'running':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'destructive';
    case 'succeeded':
      return 'primary';
    case 'unknown':
    default:
      return 'secondary';
  }
};
