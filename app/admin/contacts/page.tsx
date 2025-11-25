// app/admin/contacts/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import StatusSelect from "../components/StatusSelect";
import StatusFilter from "../components/StatusFilter"; // 💡追加
import { SubmissionType, SubmissionStatus } from "@prisma/client";

// ... (formatDate, typeLabels は変更なし) ...
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
};
  
const typeLabels: Record<string, string> = {
    REQUEST: "要望",
    BUG_REPORT: "不具合",
    ACCOUNT: "アカウント",
    OTHER: "その他",
};

// 💡 Propsで searchParams を受け取る
export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).isAdmin) redirect("/");

  // 💡 フィルタリング条件の構築
  const statusFilter = searchParams.status as SubmissionStatus | undefined;
  
  const whereCondition: any = {
    type: { not: 'PRODUCT_REQUEST' },
  };

  if (statusFilter && Object.values(SubmissionStatus).includes(statusFilter)) {
    whereCondition.status = statusFilter;
  }

  const submissions = await prisma.contactSubmission.findMany({
    where: whereCondition, // 💡 条件適用
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    }
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">問い合わせ管理</h2>
            <div className="text-sm text-gray-500 mt-1">
                全 {submissions.length} 件を表示中
            </div>
        </div>
        {/* 💡 フィルターコンポーネント配置 */}
        <StatusFilter />
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        {/* ... (テーブル部分は変更なし) ... */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  種別 / 件名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  送信者
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日時
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    該当するデータはありません
                  </td>
                </tr>
              ) : (
                submissions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusSelect id={item.id} currentStatus={item.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                          {typeLabels[item.type] || item.type}
                        </span>
                        <div className="text-sm font-bold text-gray-900 line-clamp-1">
                          {item.title}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2 mt-1 whitespace-pre-wrap">
                        {item.details}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {item.user?.name || item.submitterName || "名無し"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.user?.email || item.submitterEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}