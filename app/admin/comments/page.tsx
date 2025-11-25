// app/admin/comments/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import { FaExternalLinkAlt } from "react-icons/fa";

// 日付フォーマット
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default async function AdminCommentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).isAdmin) redirect("/");

  // コメント一覧取得
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } }, // 投稿者
      course: { select: { id: true, title: true } }, // 対象コース
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">コメント管理</h2>
        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
          全 {comments.length} 件
        </span>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  コメント内容
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  対象コース
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿者
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日時
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    コメントはありません
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 whitespace-pre-wrap line-clamp-3">
                        {comment.content}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/course/${comment.course.id}`} 
                        target="_blank"
                        className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                      >
                        {comment.course.title}
                        <FaExternalLinkAlt size={10} />
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {comment.user.name || "名称未設定"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {comment.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* 💡 target="comment" を指定 */}
                      <DeleteButton id={comment.id} target="comment" />
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