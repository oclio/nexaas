import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleHashScroll(
  event_: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string,
  callback?: () => void,
) {
  if (!href.includes('#')) {
    return;
  }

  const id = href.split('#', 2)[1];
  if (!id) {
    return;
  }

  const isLandingPage = pathname === '/' || /^\/[a-z]{2}$/.test(pathname);
  const element = document.querySelector(`#${id}`);

  if (element && isLandingPage) {
    event_.preventDefault();
    element.scrollIntoView({ behavior: 'smooth' });
    history.pushState(undefined, '', `#${id}`);
    if (callback) {
      callback();
    }
  }
}
