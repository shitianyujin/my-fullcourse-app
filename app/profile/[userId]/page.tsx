// app/profile/[userId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaEdit, FaCalendarAlt, FaBook } from 'react-icons/fa';
import CourseCard from '@/components/CourseCard';

interface UserData {
    user: {
        id: number;
        name: string;
        image: string | null;
        bio: string | null;
        courseCount: number;
        createdAt: string;
    };
    courses: Array<any>;
    isOwnProfile: boolean;
}

async function getUserProfile(userId: string): Promise<UserData | null> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    
    try {
        const res = await fetch(`${baseUrl}/api/user/${userId}`, {
            cache: 'no-store',
        });

        if (res.status === 404) return null;
        if (!res.ok) throw new Error('API Error');

        return res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

export default function ProfilePage({
    params,
}: {
    params: { userId: string };
}) {
    const userId = params.userId;
    const router = useRouter();
    
    const [profileData, setProfileData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            const data = await getUserProfile(userId);
            if (!data) {
                // 404の場合はnullのままにしてエラー表示
                setProfileData(null);
                setIsLoading(false);
                return;
            }
            setProfileData(data);
            setIsLoading(false);
        };
        fetchProfileData();
    }, [userId, router]);

    if (isLoading || !profileData) {
        if (!profileData && !isLoading) {
            return (
                <div className="flex flex-col justify-center items-center min-h-screen">
                    <p className="text-2xl text-gray-600 mb-4">ユーザーが見つかりません</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        トップページへ戻る
                    </button>
                </div>
            );
        }
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="ml-3 text-gray-600">プロフィールを読み込み中...</p>
            </div>
        );
    }

    const { user, courses, isOwnProfile } = profileData;
    const formattedJoinDate = new Date(user.createdAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* プロフィールヘッダー */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* プロフィール画像 */}
                    <div className="flex-shrink-0">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-indigo-100"
                            />
                        ) : (
                            <FaUserCircle className="w-24 h-24 md:w-32 md:h-32 text-gray-300" />
                        )}
                    </div>

                    {/* ユーザー情報 */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {user.name}
                        </h1>
                        
                        {/* 自己紹介 */}
                        {user.bio ? (
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                {user.bio}
                            </p>
                        ) : (
                            <p className="text-gray-400 italic mb-4">
                                自己紹介はまだ設定されていません
                            </p>
                        )}

                        {/* 統計情報 */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <FaBook className="text-indigo-500 mr-2" />
                                <span className="font-semibold">{user.courseCount}</span>
                                <span className="ml-1">コース投稿</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <FaCalendarAlt className="text-gray-400 mr-2" />
                                <span>{formattedJoinDate} 登録</span>
                            </div>
                        </div>

                        {/* 編集ボタン（自分のプロフィールのみ） */}
                        {isOwnProfile && (
                            <button
                                onClick={() => router.push('/profile/edit')}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                            >
                                <FaEdit className="mr-2" />
                                プロフィールを編集
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 投稿したコース一覧 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-5">
                    投稿したコース
                    <span className="ml-2 text-lg text-gray-500">({courses.length})</span>
                </h2>

                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                showEditButton={isOwnProfile}
                                currentUserId={user.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-lg">
                            {isOwnProfile 
                                ? 'まだコースを投稿していません。最初のコースを作成しましょう！'
                                : 'このユーザーはまだコースを投稿していません。'}
                        </p>
                        {isOwnProfile && (
                            <button
                                onClick={() => router.push('/course/new')}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                コースを作成
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}