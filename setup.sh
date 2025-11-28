#!/bin/bash

echo "=========================================="
echo "🚀 MyFullcourseApp 環境セットアップを開始します 🚀"
echo "=========================================="

# 1. パッケージのインストール
echo "--- 1. 必要なnpmパッケージをインストール中..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install に失敗しました。ログを確認してください。"
    exit 1
fi
echo "✅ npmパッケージのインストールが完了しました。"

# 2. Prisma Clientの生成とDBマイグレーション
echo "--- 2. Prisma Clientの生成およびDBへのマイグレーションを実行中..."
npx prisma migrate dev --name init_db
if [ $? -ne 0 ]; then
    echo "⚠️ マイグレーションファイル作成に失敗した可能性があります。ログを確認してください。"
fi

echo "✅ Prismaのセットアップ（マイグレーションとClient生成）が完了しました。"

echo "=========================================="
echo "🎉 セットアップ完了！"
echo "次の手順："
echo "1. DBサーバーが起動していることを確認してください。"
echo "2. 以下のコマンドで開発サーバーを起動してください。"
echo "   npm run dev "
echo "=========================================="
