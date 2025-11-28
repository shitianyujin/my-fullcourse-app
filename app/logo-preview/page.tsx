// app/logo-preview/page.tsx
import React from 'react';

export default function LogoPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">ロゴデザイン比較</h1>

        {/* =================================================================
            案1: Orefull (おれふる)
           ================================================================= */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-10">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-indigo-900">案1. Orefull (おれふる)</h2>
            <p className="text-gray-500 text-sm mt-1">
              コンセプト：熱量、自分らしさ、エネルギー、親しみやすさ
            </p>
          </div>

          <div className="space-y-8">
            {/* ヘッダーでの表示イメージ */}
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Header Image</p>
              <div className="h-16 bg-white border border-gray-200 rounded-lg flex items-center px-6">
                {/* LOGO START */}
                <div className="flex items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="#4F46E5"/>
                    <path d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26C21.5228 26 26 21.5228 26 16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M16 11V21" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M11 16H21" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xl font-extrabold tracking-tight text-gray-900">
                    Orefull
                  </span>
                </div>
                {/* LOGO END */}
                <div className="ml-auto flex gap-4 text-sm text-gray-400 font-medium">
                  <span>ランキング</span>
                  <span>探す</span>
                  <span>ログイン</span>
                </div>
              </div>
            </div>

            {/* アプリアイコン (ファビコン) */}
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">App Icon</p>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26C21.5228 26 26 21.5228 26 16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M16 11V21" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M11 16H21" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                   <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="#4F46E5"/>
                    <path d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26C21.5228 26 26 21.5228 26 16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M16 11V21" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M11 16H21" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =================================================================
            案2: Reitaku (レイタク)
           ================================================================= */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800">案2. Reitaku (レイタク)</h2>
            <p className="text-gray-500 text-sm mt-1">
              コンセプト：知性、大人の遊び、洗練、レストランのような空間
            </p>
          </div>

          <div className="space-y-8">
            {/* ヘッダーでの表示イメージ */}
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Header Image</p>
              <div className="h-16 bg-white border border-gray-200 rounded-lg flex items-center px-6">
                {/* LOGO START */}
                <div className="flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2L19 12L29 12L21 19L24 29L16 22L8 29L11 19L3 12L13 12L16 2Z" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 8V24" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 16H24" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xl tracking-wide text-slate-800" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 600 }}>
                    Reitaku
                  </span>
                </div>
                {/* LOGO END */}
                <div className="ml-auto flex gap-4 text-sm text-gray-400 font-medium">
                  <span>ランキング</span>
                  <span>探す</span>
                  <span>ログイン</span>
                </div>
              </div>
            </div>

            {/* アプリアイコン (ファビコン) */}
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">App Icon</p>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2L19 12L29 12L21 19L24 29L16 22L8 29L11 19L3 12L13 12L16 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                   <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2L19 12L29 12L21 19L24 29L16 22L8 29L11 19L3 12L13 12L16 2Z" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}