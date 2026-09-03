import {
  ArrowRight01Icon,
  Cancel01Icon,
  Facebook02Icon,
  InstagramIcon,
  Linkedin02Icon,
  Menu01Icon,
  Moon02Icon,
  NewTwitterIcon,
  Sun02Icon,
  ThreadsIcon,
  Tick02Icon,
  TiktokIcon,
} from '@hugeicons/core-free-icons';

/**
 * Central icon registry — every component imports from here instead of
 * referencing icon objects directly. Ensures the same icon is reused
 * across the app: one source of truth, no duplicate imports for the
 * same purpose. Swap or rename an icon in one place without touching
 * component code.
 */
export const ICONS = {
  cancel: Cancel01Icon,
  chevronRight: ArrowRight01Icon,
  menu: Menu01Icon,
  socialFacebook: Facebook02Icon, // footer social links
  socialInstagram: InstagramIcon,
  socialLinkedin: Linkedin02Icon,
  socialThreads: ThreadsIcon,
  socialTiktok: TiktokIcon,
  socialTwitter: NewTwitterIcon,
  themeDark: Moon02Icon, // theme toggle
  themeLight: Sun02Icon,
  tick: Tick02Icon,
};
