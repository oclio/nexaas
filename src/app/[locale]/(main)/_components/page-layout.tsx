import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  children?: ReactNode;
}

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="page-section flex flex-col gap-8 pt-24">
      <h1 className="page-title">{title}</h1>
      {children}
    </div>
  );
}
