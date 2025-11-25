// app/admin/components/StatusSelect.tsx
'use client';

import { useState } from 'react';
import { updateSubmissionStatus } from '../actions'; // 先ほど作ったアクション
import { SubmissionStatus } from "@prisma/client";

interface Props {
  id: number;
  currentStatus: SubmissionStatus;
}

const statusLabels: Record<SubmissionStatus, string> = {
  OPEN: "未対応",
  IN_PROGRESS: "対応中",
  RESOLVED: "解決済",
  CLOSED: "完了",
};

const statusColors: Record<SubmissionStatus, string> = {
  OPEN: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default function StatusSelect({ id, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as SubmissionStatus;
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      await updateSubmissionStatus(id, newStatus);
    } catch (error) {
      alert("更新に失敗しました");
      setStatus(currentStatus); // 元に戻す
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isUpdating}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 ${statusColors[status]} ${isUpdating ? 'opacity-50' : ''}`}
    >
      {Object.keys(statusLabels).map((key) => (
        <option key={key} value={key} className="bg-white text-gray-900">
          {statusLabels[key as SubmissionStatus]}
        </option>
      ))}
    </select>
  );
}