"use client"; // クライアントコンポーネントとして実行 (useState, onClickなどのHooksを使用するため)

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

// このコンポーネントで登録とログインの両方を処理
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // true: ログイン, false: 登録
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // 登録時のみ使用
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // エラーメッセージをリセット

    if (isLogin) {
      // ----------------------------------------------------
      // A. ログイン処理 (signIn - NextAuthのCredentialsProviderを使用)
      // ----------------------------------------------------
      const result = await signIn('credentials', {
        redirect: false, // 自動リダイレクトを無効化し、手動で処理
        email,
        password,
      });

      if (result?.error) {
        // Auth.jsの認証失敗時のエラーメッセージを表示
        setError('ログインに失敗しました。メールアドレスまたはパスワードが違います。');
      } else {
        // ログイン成功: トップページへリダイレクト
        router.push('/');
      }
    } else {
      // ----------------------------------------------------
      // B. 新規登録処理 (POST /api/register - 自作APIルートを使用)
      // ----------------------------------------------------
      if (!name) {
        setError('ユーザー名を入力してください。');
        return;
      }
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });

      if (response.ok) {
        alert('登録が完了しました。続けてログインしてください。');
        setIsLogin(true); // 登録成功後、ログインフォームに切り替える
        setName(''); // 登録が完了したのでユーザー名をクリア
        // emailとpasswordは残しておくことで、すぐにログインできる状態にする
      } else {
        const data = await response.json();
        // APIルートで設定したエラーメッセージ（例: 既にユーザーが存在します）を表示
        setError(data.message || '登録に失敗しました。'); 
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>{isLogin ? 'ログイン' : '新規登録'}</h1>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>ユーザー名</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
        )}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>メールアドレス</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
        </div>
        
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
        
        <button type="submit" 
          style={{ width: '100%', padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          {isLogin ? 'ログイン' : '登録して始める'}
        </button>
      </form>
      <div style={{ marginTop: '25px', textAlign: 'center' }}>
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}>
          {isLogin ? 'アカウントをお持ちでない方はこちら（新規登録）' : 'ログイン画面に戻る'}
        </button>
      </div>
    </div>
  );
}