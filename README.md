# My Fullcourse App

## 概要

Next.js App Router、TypeScript、Prisma (MySQL)、NextAuth.js を使用した、フルスタックのコース管理アプリケーションです。

## 必須環境

- Node.js (LTS 推奨)
- MySQL サーバー
- Git

## 1. 環境構築手順 (Initial Setup)

新しい端末で開発を始める際は、以下の手順を実行してください。

### 1-1. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の変数を設定します。

**MySQL データベース接続情報**  
（ユーザー名、パスワード、DB名を適宜変更）
```
DATABASE_URL="postgresql://fullcourse_user:F7z%2B%286tN@localhost:5432/my_fullcourse_db?schema=public"
```

**NextAuth.js 関連設定**  
認証トークンやセッション暗号化に使用される秘密鍵
```env
AUTH_SECRET="安全なランダム文字列"
```

アプリケーションが動作する URL
```env
NEXTAUTH_URL="http://localhost:3000"
```
Amazonアソシエイト（任意）
```
NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG="あなたのアソシエイトID"
```

### 1-2. 初期化スクリプトの配置と実行

プロジェクトルートに `setup.sh` を配置し、以下のコマンドで実行します。
```bash
# 1. スクリプトに実行権限を付与
chmod +x setup.sh

# 2. セットアップスクリプトを実行
./setup.sh
```

## 2. 開発サーバーの起動

```
npm run dev
```

## 3. 認証機能の確認

サーバー起動後、以下の URL にアクセスして動作を確認します。

- **トップページ**: http://localhost:3000/

## 4. 主な技術スタック

| 分類 | 使用技術 |
|------|----------|
| フレームワーク | Next.js (v16.x), React |
| 言語 | TypeScript |
| データベース | PostgreSQL |
| ORM | Prisma |
| 認証 | NextAuth.js (Credentials Provider) |
| スタイル | Tailwind CSS |

## 5. データベース操作

Prisma に関連する主要コマンドです。

### マイグレーションの実行（スキーマ変更時）
```
npx prisma migrate dev --name <変更内容を示す名前>
```

### Prisma Studio の起動（GUI でデータ確認）
```
npx prisma studio
```
