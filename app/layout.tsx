import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simply Market Intelligence OS",
  description: "System AI do analizy rynku, konkurencji, głosu klientów i lokalnego popytu.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
