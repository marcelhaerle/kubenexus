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
    case 'terminating':
    case 'containercreating':
      return 'warning';
    case 'failed':
    case 'error':
    case 'crashloopbackoff':
    case 'errimagepull':
      return 'destructive';
    case 'succeeded':
      return 'primary';
    case 'unknown':
    default:
      return 'secondary';
  }
};

export const formatDateISO = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj.toISOString();
};
