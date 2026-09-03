import {
  Facebook02Icon,
  InstagramIcon,
  Linkedin02Icon,
  NewTwitterIcon,
  ThreadsIcon,
  TiktokIcon,
} from '@hugeicons/core-free-icons';
import { IconSvgElement } from '@hugeicons/react';

export interface NavigationItem {
  label: string;
  href: string;
  location: ('navbar' | 'footer' | 'mobileMenu')[];
  category?: string;
}

interface SocialLink {
  name: string;
  icon: IconSvgElement;
  href: string;
}

export interface NavigationCategory {
  title: string;
  key: string;
}

export const navigationCategories: NavigationCategory[] = [
  {
    title: 'components.footer.categories.product',
    key: 'product',
  },
  {
    title: 'components.footer.categories.help',
    key: 'help',
  },
  {
    title: 'components.footer.categories.company',
    key: 'company',
  },
  {
    title: 'components.footer.categories.legal',
    key: 'legal',
  },
];

export const navigation: NavigationItem[] = [
  {
    label: 'pages.landing.features.title',
    href: '/#features-section',
    location: ['navbar', 'footer', 'mobileMenu'],
    category: 'product',
  },
  {
    label: 'pages.landing.pricing.title',
    href: '/#pricing-section',
    location: ['navbar', 'footer', 'mobileMenu'],
    category: 'product',
  },
  {
    label: 'pages.faq.shortTitle',
    href: '/#faq-section',
    location: ['navbar', 'mobileMenu', 'footer'],
    category: 'help',
  },
  {
    label: 'pages.whatIsIncluded.title',
    href: '/#what-is-included-section',
    location: ['navbar', 'footer', 'mobileMenu'],
    category: 'product',
  },
  {
    label: 'pages.landing.cta.title',
    href: '/#cta-section',
    location: ['navbar', 'mobileMenu'],
    category: 'product',
  },
  {
    label: 'pages.help.shortTitle',
    href: '#',
    location: ['footer'],
    category: 'help',
  },
  {
    label: 'pages.documentation.title',
    href: '#',
    location: ['footer', 'mobileMenu'],
    category: 'help',
  },
  {
    label: 'pages.contact.title',
    href: '/contact',
    location: ['footer', 'mobileMenu'],
    category: 'help',
  },
  {
    label: 'pages.about.title',
    href: '#',
    location: ['footer'],
    category: 'company',
  },
  {
    label: 'pages.careers.title',
    href: '#',
    location: ['footer'],
    category: 'company',
  },
  {
    label: 'pages.partners.title',
    href: '#',
    location: ['footer'],
    category: 'company',
  },
  {
    label: 'pages.press.title',
    href: '#',
    location: ['footer'],
    category: 'company',
  },
  {
    label: 'pages.terms.shortTitle',
    href: '/terms-of-service',
    location: ['footer'],
    category: 'legal',
  },
  {
    label: 'pages.privacy.shortTitle',
    href: '/privacy-policy',
    location: ['footer'],
    category: 'legal',
  },
  {
    label: 'pages.cookies.shortTitle',
    href: '/cookie-policy',
    location: ['footer'],
    category: 'legal',
  },
  {
    label: 'pages.license.title',
    href: '/license',
    location: ['footer'],
    category: 'legal',
  },
];

export const socialLinks: SocialLink[] = [
  {
    name: 'X/Twitter',
    icon: NewTwitterIcon,
    href: '#',
  },
  {
    name: 'Linkedin',
    icon: Linkedin02Icon,
    href: '#',
  },
  {
    name: 'Facebook',
    icon: Facebook02Icon,
    href: '#',
  },
  {
    name: 'Threads',
    icon: ThreadsIcon,
    href: '#',
  },
  {
    name: 'Instagram',
    icon: InstagramIcon,
    href: '#',
  },
  {
    name: 'Tiktok',
    icon: TiktokIcon,
    href: '#',
  },
];
