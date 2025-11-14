"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 認証状態の確認
  useEffect(() => {
    // セッションロード中でなく、かつ認証されていない場合はログインページへリダイレクト
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>認証情報をロード中...</h1>
      </div>
    );
  }

  // 認証済みの場合
  // TODO: ユーザーIDの削除
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>👤 プロフィール</h2>
      <hr style={{ margin: '15px 0' }} />
      <p><strong>ユーザー名:</strong> {session?.user?.name}</p>
      <p><strong>メールアドレス:</strong> {session?.user?.email}</p>
      <p><strong>ユーザーID:</strong> {session?.user?.id}</p>
      
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <Link href="/">
          <button style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px' }}>
            トップページへ
          </button>
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}