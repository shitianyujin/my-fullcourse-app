// app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { FaHome, FaUsers, FaComments, FaEnvelope, FaBoxOpen, FaSignOutAlt } from "react-icons/fa";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // 1. ログインチェック & 管理者チェック
  if (!session || !session.user || !(session.user as any).isAdmin) {
    // 管理者でなければトップへリダイレクト
    redirect("/");
  }

  const menuItems = [
    { name: "ダッシュボード", href: "/admin", icon: FaHome },
    { name: "ユーザー管理", href: "/admin/users", icon: FaUsers },
    { name: "コメント管理", href: "/admin/comments", icon: FaComments },
    { name: "問い合わせ管理", href: "/admin/contacts", icon: FaEnvelope },
    { name: "商品追加依頼", href: "/admin/requests", icon: FaBoxOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* サイドバー */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:block">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">管理画面</h1>
          <p className="text-xs text-gray-400 mt-1">MyFullCourse App</p>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
            >
              <item.icon className="mr-3" />
              {item.name}
            </Link>
          ))}
          <div className="border-t border-gray-800 my-4 pt-4">
             <Link href="/" className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition text-sm">
                <FaSignOutAlt className="mr-3" />
                サイトに戻る
             </Link>
          </div>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* モバイル用ヘッダー (簡易版) */}
        <header className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
            <span className="font-bold">管理画面</span>
            <Link href="/" className="text-sm">戻る</Link>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}