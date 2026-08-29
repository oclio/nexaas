import type { Metadata } from "next";
import { fontHeading, fontSans } from "@/ui/fonts";
import "@/ui/styles/globals.css";
import { app } from "@/core/config";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: app.title,
  description: app.description,
  icons: {
    icon: app.logo,
  },
};

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<Props>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
