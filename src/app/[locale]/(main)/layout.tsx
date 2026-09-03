import { ReactNode } from 'react';

import Footer from './_components/footer/footer';
import Navbar from './_components/navbar/navbar';

interface Props {
  children: ReactNode;
}

export default async function MainLayout({ children }: Readonly<Props>) {
  return (
    <div className="flex min-h-svh flex-col gap-8 md:gap-12">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
