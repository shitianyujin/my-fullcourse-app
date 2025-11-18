import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from '@/components/Navbar'; 

export const metadata: Metadata = {
  title: "My Fullcourse App",
  description: "次に行くべきフルコースを管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Providers>
        <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}