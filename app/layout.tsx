import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers"; 

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
          {children}
        </Providers>
      </body>
    </html>
  );
}