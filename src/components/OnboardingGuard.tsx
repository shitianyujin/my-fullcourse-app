// src/components/OnboardingGuard.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // リダイレクトが必要かどうかの判定
  const needsOnboarding = 
    status === 'authenticated' && 
    !session?.user?.name && 
    pathname !== '/onboarding' && 
    !pathname.startsWith('/api');

  useEffect(() => {
    if (needsOnboarding) {
      router.replace('/onboarding');
    }
  }, [needsOnboarding, router]);

  // 1. セッション読み込み中
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        {/* 画面中央にローディングスピナーを表示 */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 2. リダイレクト対象の場合（useEffectが走るまでの間、コンテンツを隠してローディングを表示）
  if (needsOnboarding) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 3. 問題なければコンテンツを表示
  return <>{children}</>;
};