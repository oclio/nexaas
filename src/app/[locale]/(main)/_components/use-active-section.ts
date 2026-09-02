import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string>('');

  // Extract as string for useEffect dependencies
  const sectionIdsString = sectionIds.join(',');

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = '';
      const triggerLine = 200;

      const ids = sectionIdsString.split(',');

      for (const id of ids) {
        if (!id) continue;
        const element = document.querySelector(`#${id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= triggerLine && rect.bottom > triggerLine) {
            currentSection = id;
          }
        }
      }

      if (window.scrollY < 50) {
        currentSection = '';
      }

      setActiveSection((previous) =>
        previous === currentSection ? previous : currentSection,
      );
    };

    // eslint-disable-next-line unicorn/prefer-observer-apis
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIdsString]);

  return activeSection;
}
