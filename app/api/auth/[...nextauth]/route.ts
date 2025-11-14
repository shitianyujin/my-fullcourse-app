import NextAuth from "next-auth";
// src/lib/auth.ts で定義した認証設定をインポート
import { authOptions } from "@/lib/auth"; 

// NextAuthのハンドラーを生成
const handler = NextAuth(authOptions);

// GETとPOSTの両方をエクスポート
export { handler as GET, handler as POST };