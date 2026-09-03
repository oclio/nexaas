import { parsePathname } from '@/core/i18n/parse-pathname';

export function handleHashScroll(
  event_: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string,
  callback?: () => void,
) {
  const match = /#([^#]+)/.exec(href);
  if (!match) {
    return;
  }

  const id = match[1];
  const { path } = parsePathname(pathname);
  const element = document.querySelector(`#${id}`);

  if (element && path === '/') {
    event_.preventDefault();
    element.scrollIntoView({ behavior: 'smooth' });
    history.pushState(undefined, '', `#${id}`);
    if (callback) {
      callback();
    }
  }
}
