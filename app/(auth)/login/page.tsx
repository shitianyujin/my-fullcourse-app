"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
// 💡 useSearchParams をインポート
import { useRouter, useSearchParams } from 'next/navigation'; 
import React from 'react';

// このコンポーネントで登録とログインの両方を処理
export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); 
    const [error, setError] = useState('');
    
    const router = useRouter();
    // 💡 URLのクエリパラメータを取得
    const searchParams = useSearchParams();
    
    // 💡 callbackUrl を取得。URLになければデフォルトでトップページ ('/') に設定
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); 

        if (isLogin) {
            // ----------------------------------------------------
            // A. ログイン処理
            // ----------------------------------------------------
            const result = await signIn('credentials', {
                redirect: false, 
                email,
                password,
                // 💡 callbackUrl を signIn 関数に渡す
                callbackUrl: callbackUrl, 
            });

            if (result?.error) {
                setError('ログインに失敗しました。メールアドレスまたはパスワードが違います。');
            } else {
                // 💡 ログイン成功: callbackUrl で指定された元のページへリダイレクト
                router.push(callbackUrl); 
            }
        } else {
            // ----------------------------------------------------
            // B. 新規登録処理 (変更なし)
            // ----------------------------------------------------
            if (!name) {
                setError('ユーザー名を入力してください。');
                return;
            }
            
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, password }),
            });

            if (response.ok) {
                alert('登録が完了しました。続けてログインしてください。');
                setIsLogin(true); 
                setName(''); 
            } else {
                const data = await response.json();
                setError(data.message || '登録に失敗しました。'); 
            }
        }
    };

    // ... (UI部分のコードは変更なし) ...
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>{isLogin ? 'ログイン' : '新規登録'}</h1>
            <form onSubmit={handleSubmit}>
                {/* ユーザー名入力フィールド (登録時のみ) */}
                {!isLogin && (
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>ユーザー名</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} 
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                )}
                {/* メールアドレス入力フィールド */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>メールアドレス</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                {/* パスワード入力フィールド */}
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