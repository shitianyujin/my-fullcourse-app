// app/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { FaUserCircle, FaExternalLinkAlt } from "react-icons/fa";
import DeleteButton from "../components/DeleteButton";
import RoleToggleButton from "../components/RoleToggleButton"; // 💡追加
import Link from "next/link";

// ... (formatDate関数はそのまま) ...
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any).isAdmin) redirect("/");

  // 💡 現在のログインユーザーIDを取得 (自分判定用)
  const currentUserId = parseInt((session.user as any).id);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      courseCount: true,
      createdAt: true,
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ユーザー管理</h2>
        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
          全 {users.length} 名
        </span>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  権限
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿数
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/profile/${user.id}`} className="flex items-center cursor-pointer">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.image ? (
                          <img className="h-10 w-10 rounded-full object-cover border group-hover:border-indigo-400 transition" src={user.image} alt="" />
                        ) : (
                          <FaUserCircle className="h-10 w-10 text-gray-300 group-hover:text-indigo-400 transition" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition flex items-center gap-2">
                          {user.name || "名称未設定"}
                          <FaExternalLinkAlt className="text-xs text-gray-400 opacity-0 group-hover:opacity-100" />
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* 💡 RoleToggleButtonに置き換え */}
                    <RoleToggleButton 
                        userId={user.id} 
                        isAdmin={user.isAdmin} 
                        isSelf={user.id === currentUserId} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-bold">{user.courseCount}</span> 件
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* 自分自身でなければ削除ボタンを表示 */}
                    {user.id !== currentUserId && (
                      <DeleteButton id={user.id} target="user" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}