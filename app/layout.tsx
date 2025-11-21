// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from '@/components/Navbar'; 
import { Footer } from '@/components/Footer';
import { OnboardingGuard } from "@/components/OnboardingGuard"; // 💡 追加

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
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers>
          {/* 💡 Navbarの前にガードを配置しても良いですが、
              Navbarを表示しつつコンテンツだけ隠すか、
              全体をガードするかは選択できます。
              ここでは「全体」をガードの下に置き、Navbarは表示される構成にします。
           */}
          <OnboardingGuard>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </OnboardingGuard>
        </Providers>
      </body>
    </html>
  );
}