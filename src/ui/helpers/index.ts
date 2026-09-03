import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { handleHashScroll } from './handle-hash-scroll';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
