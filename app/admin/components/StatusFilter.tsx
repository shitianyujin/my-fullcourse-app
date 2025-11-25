// app/admin/components/StatusFilter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const statusOptions = [
  { label: 'すべて', value: 'ALL' },
  { label: '未対応', value: 'OPEN' },
  { label: '対応中', value: 'IN_PROGRESS' },
  { label: '解決済', value: 'RESOLVED' },
  { label: '完了', value: 'CLOSED' },
];

export default function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'ALL';

  const handleFilterChange = useCallback((status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (status === 'ALL') {
      params.delete('status'); // すべての場合はパラメータを削除
    } else {
      params.set('status', status);
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg inline-block">
      {statusOptions.map((option) => {
        const isActive = currentStatus === option.value;
        return (
          <button
            key={option.value}
            onClick={() => handleFilterChange(option.value)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-md transition-all
              ${isActive 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}