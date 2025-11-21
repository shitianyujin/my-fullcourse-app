// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FaEnvelope, FaBoxOpen, FaUsers } from "react-icons/fa";

// データを取得する関数
async function getAdminStats() {
  const [
    pendingContacts,
    pendingRequests,
    totalUsers,
    totalCourses
  ] = await Promise.all([
    // 未対応(OPEN)の問い合わせ
    prisma.contactSubmission.count({
      where: { type: { not: 'PRODUCT_REQUEST' }, status: 'OPEN' }
    }),
    // 未対応(OPEN)の商品追加依頼
    prisma.contactSubmission.count({
      where: { type: 'PRODUCT_REQUEST', status: 'OPEN' }
    }),
    prisma.user.count(),
    prisma.course.count(),
  ]);

  return { pendingContacts, pendingRequests, totalUsers, totalCourses };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* カード 1: 問い合わせ */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">未対応の問い合わせ</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingContacts}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <FaEnvelope size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/contacts" className="text-sm text-indigo-600 hover:underline">
              すべて確認する &rarr;
            </Link>
          </div>
        </div>

        {/* カード 2: 商品追加依頼 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">未対応の商品追加依頼</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingRequests}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <FaBoxOpen size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/requests" className="text-sm text-green-600 hover:underline">
              すべて確認する &rarr;
            </Link>
          </div>
        </div>

        {/* カード 3: ユーザー数 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-400">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-sm text-gray-500 font-medium">総ユーザー数</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</h3>
            </div>
             <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
              <FaUsers size={24} />
            </div>
          </div>
        </div>
        
        {/* カード 4: コース数 */}
         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-400">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-sm text-gray-500 font-medium">投稿コース数</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCourses}</h3>
            </div>
             <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
               <span className="text-2xl font-bold">🍽️</span>
            </div>
          </div>
        </div>
      </div>

      {/* ここに後で「最近の問い合わせ一覧」などを追加できます */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-500 text-center py-10">
          左のメニューから各管理画面へ移動してください。
        </p>
      </div>
    </div>
  );
}