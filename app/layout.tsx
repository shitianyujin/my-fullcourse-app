import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from '@/components/Navbar'; 
import { Footer } from '@/components/Footer'; // 追加

export const metadata: Metadata = {
  title: "MyFullCourseApp",
  description: "次に行くべきフルコースを管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* 
        h-full, min-h-screen, flex-col を設定し、
        コンテンツが少ない場合でもFooterが最下部に来るようにする 
      */}
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers>
          <Navbar />
          {/* NavbarとFooterの間で余白を埋める */}
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}