import Link from 'next/link';

export { Link };

export function redirect() {
  return undefined;
}

export function usePathname() {
  return '/';
}

export function useRouter() {
  return {
    push: () => undefined,
    replace: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
    prefetch: () => undefined,
  };
}

export function getPathname() {
  return '/';
}

export function useSearchParams() {
  return new URLSearchParams();
}
