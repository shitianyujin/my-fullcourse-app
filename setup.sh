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

# DB接続情報（DATABASE_URL）を読み込むため、dotenv -c を使用
npx dotenv -c -- prisma migrate dev --name init --create-only
if [ $? -ne 0 ]; then
    echo "⚠️ マイグレーションファイル作成に失敗した可能性があります。ログを確認してください。"
fi

# 生成されたマイグレーションファイルをDBに適用 (通常、migrate dev --nameで自動適用されるが、確実に)
npx dotenv -c -- prisma migrate dev --skip-generate
if [ $? -ne 0 ]; then
    echo "❌ データベースマイグレーションに失敗しました。DBサーバーが起動しているか確認してください。"
    exit 1
fi

# 最後に、必ずクライアントを生成し直す
npx dotenv -c -- prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Prisma Clientの生成に失敗しました。"
    exit 1
fi

echo "✅ Prismaのセットアップ（マイグレーションとClient生成）が完了しました。"

echo "=========================================="
echo "🎉 セットアップ完了！"
echo "次の手順："
echo "1. DBサーバーが起動していることを確認してください。"
echo "2. 以下のコマンドで開発サーバーを起動してください。"
echo "   npm run dev -- --webpack"
echo "=========================================="
