// src/app/create/page.tsx

import { CourseForm } from '@/components/CourseForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'フルコース投稿 - 新しいコースを作成',
};

/**
 * フルコース作成ページ
 */
export default function CreateCoursePage() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <CourseForm />
    </main>
  );
}