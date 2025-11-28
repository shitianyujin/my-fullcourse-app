import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'header' | 'footer' | 'symbol';
}

export const Logo: React.FC<LogoProps> = ({ className = "", variant = 'header' }) => {
  // アイコン画像のパス (publicフォルダ内)
  const iconSrc = "/icon.png";

  // シンボルマーク（画像）の表示部分
  const Symbol = ({ sizeClass }: { sizeClass: string }) => (
    <img 
      src={iconSrc} 
      alt="おれふるロゴ" 
      className={`${sizeClass} object-contain rounded-md shadow-sm`} 
    />
  );

  // テキスト部分 (Zen Maru Gothicを適用)
  const Text = ({ textSize }: { textSize: string }) => (
    <span 
      className={`font-bold text-gray-800 ${textSize}`}
      style={{ fontFamily: 'var(--font-kiwi-maru), sans-serif', letterSpacing: '0.05em' }}
    >
      おれふる
    </span>
  );

  // --- バリエーションごとの表示 ---

  // 1. シンボルのみ (アイコン単体)
  if (variant === 'symbol') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {/* 親のサイズに合わせて画像を表示 */}
        <img src={iconSrc} alt="おれふる" className="w-full h-full object-contain rounded-xl shadow-sm" />
      </div>
    );
  }

  // 2. フッター用 (少し小さめ、またはレイアウト調整)
  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Symbol sizeClass="w-8 h-8" />
        <Text textSize="text-xl" />
      </div>
    );
  }

  // 3. ヘッダー用 (デフォルト)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ロゴ画像 */}
      <Symbol sizeClass="w-10 h-10" />
      
      {/* サービス名 */}
      <Text textSize="text-2xl" />
    </div>
  );
};