// src/components/InteractiveBadge.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { FaHeart, FaSpinner, FaUtensils } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface InteractiveBadgeProps {
    courseId: number;
    initialCount: number;
    initialIsActive: boolean; // isWantsToEat -> initialIsActive に変更
    type: 'wantsToEat' | 'tried'; // 💡 typeプロパティを追加
}

export default function InteractiveBadge({
    courseId,
    initialCount,
    initialIsActive,
    type,
}: InteractiveBadgeProps) {
    
    const router = useRouter();
    const [count, setCount] = useState(initialCount);
    const [isActive, setIsActive] = useState(initialIsActive);
    const [isPending, startTransition] = useTransition();

    // 💡 typeに応じてスタイルとAPIパスを決定
    const config = {
        wantsToEat: {
            apiPath: `/api/courses/${courseId}/wants-to-eat`,
            icon: FaHeart,
            text: '食べたい',
            baseColor: 'pink',
        },
        tried: {
            apiPath: `/api/courses/${courseId}/tried`,
            icon: FaUtensils,
            text: '食べた',
            baseColor: 'green',
        },
    }[type];

    const Icon = config.icon;
    const baseColor = config.baseColor;

    const handleClick = async () => {
        if (isPending) return;

        startTransition(async () => {
            try {
                // 💡 configからAPIパスを使用
                const res = await fetch(config.apiPath, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (res.status === 401) {
                    alert('この操作にはログインが必要です。');
                    router.push(`/login?callbackUrl=/course/${courseId}`);
                    return;
                }

                if (!res.ok) {
                    alert('処理に失敗しました。サーバーエラーを確認してください。');
                    return;
                }
                
                const data = await res.json();

                if (data.added !== undefined) {
                    setIsActive(data.added);
                    setCount(prev => data.added ? prev + 1 : prev - 1);
                }

            } catch (error) {
                console.error(`${config.text}処理エラー:`, error);
                alert('通信エラーが発生しました。');
            }
        });
    };

    // 💡 動的なクラス生成
    const baseClasses = "flex items-center px-3 py-1.5 rounded-full border shadow-sm transition-all duration-200 cursor-pointer text-sm";
    
    // Tailwindの動的クラスを扱うため、フルネームで指定
    const activeBg = `bg-${baseColor}-100`;
    const activeText = `text-${baseColor}-700`;
    const activeBorder = `border-${baseColor}-200`;
    const activeHover = `hover:bg-${baseColor}-200`;
    
    const inactiveBg = `bg-${baseColor}-50`;
    const inactiveText = `text-${baseColor}-600`;
    const inactiveBorder = `border-${baseColor}-100`;
    const inactiveHover = `hover:bg-${baseColor}-100`;

    const dynamicClasses = isActive
        ? `${activeBg} ${activeText} ${activeBorder} ${activeHover}`
        : `${inactiveBg} ${inactiveText} ${inactiveBorder} ${inactiveHover}`;

    const disabledClasses = isPending ? "opacity-70 cursor-not-allowed" : "";

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`${baseClasses} ${dynamicClasses} ${disabledClasses}`}
        >
            {isPending ? (
                <FaSpinner className="animate-spin mr-2" />
            ) : (
                <Icon className="mr-2" />
            )}
            
            <span className="font-bold mr-1">
                {count}
            </span>
            <span className="text-xs ml-1">
                {config.text}
            </span>
        </button>
    );
}