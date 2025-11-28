// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from '@/components/Navbar'; 
import { Footer } from '@/components/Footer';
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { Kiwi_Maru } from "next/font/google"; 
import "./globals.css";

const kiwiMaru = Kiwi_Maru({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kiwi-maru",
});

export const metadata: Metadata = {
  // 1. ベースURL（本番公開時にドメインが決まったら環境変数などで書き換えます）
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),

  // 2. タイトル設定（各ページで title を設定した時のテンプレート）
  title: "おれふる",
  description: "冷凍食品を組み合わせて、あなただけの最強フルコースを作って共有しよう。",

  // 3. アイコン設定（先ほどのpublic/icon.pngを指定してエラー回避）
  icons: {
    icon: '/icon.png',
    apple: '/icon.png', // iPhoneのホーム画面用
  },

  // 4. OGP設定（LINEやX、Discordなどでシェアされた時のカード表示）
  openGraph: {
    title: "おれふる - 俺のフルコース",
    description: "冷凍食品でつくる、大人の本気のフルコース投稿サイト。",
    url: '/',
    siteName: 'おれふる',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/icon.png', // シェア時の画像（専用の横長画像を作ったら差し替えるとベスト）
        width: 512,
        height: 512,
        alt: 'おれふるロゴ',
      },
    ],
  },

  // 5. Twitter用設定
  twitter: {
    card: 'summary', // 正方形の画像の場合は 'summary'、横長なら 'summary_large_image'
    title: "おれふる - 俺のフルコース",
    description: "冷凍食品を組み合わせて、あなただけの最強フルコースを作って共有しよう。",
    images: ['/icon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`min-h-screen flex flex-col bg-gray-50 ${kiwiMaru.variable}`}>
        <Providers>
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