import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt"; // パスワードハッシュ化ライブラリ
import { User as AuthUser } from "next-auth";

// bcryptのインストール（次のステップで実行します）
// npm install bcrypt @types/bcrypt

export const authOptions: AuthOptions = {
  // 1. Adapter (認証情報保存先) の設定
  adapter: PrismaAdapter(prisma),

  // 2. Session の設定
  session: {
    strategy: "jwt", // 認証状態をJWTトークンで管理 (App Routerでの推奨)
  },
  
  // 3. Providers (認証方法) の設定
  providers: [
    // メールアドレスとパスワードによる認証プロバイダー
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) : Promise<AuthUser | null>{
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // DBからユーザーを検索
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // ユーザーが存在しない、またはパスワードが不正
        if (!user || !user.hashedPassword) {
          return null;
        }

        // パスワードの照合（実際のハッシュと比較）
        const isMatch = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (isMatch) {
          // 認証成功: PrismaのUserオブジェクトを、AuthUser型に合うように変換して返す
          // NextAuthはID, Name, Email, Imageなどの標準フィールドのみをSessionに格納する
          return {
            id: user.id.toString(), // ★NextAuthはIDをstringで扱うため変換
            name: user.name,
            email: user.email,
            image: user.image,
            // hashedPasswordは返さない
          } as AuthUser; // AuthUserとしてアサーション
        }

        // 認証失敗
        return null;
      },
    }),
    // 将来的にGoogleやGitHubなどのOAuthプロバイダーを追加可能
  ],

  // 4. カスタムページの定義
  pages: {
    signIn: '/login', // ログインが必要な時にリダイレクトされるカスタムログインページ
    // signOut: '/auth/signout',
    // error: '/auth/error', // エラーページ
  },

  // 5. 秘密鍵の設定 (.envから読み込まれる)
  secret: process.env.AUTH_SECRET,
};