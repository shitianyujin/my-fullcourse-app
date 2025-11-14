import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { User as AuthUser } from "next-auth";

export const authOptions: NextAuthOptions = {
  // 1. Adapter (認証情報保存先) の設定
  adapter: PrismaAdapter(prisma),

  // 2. Session の設定
  session: {
    strategy: "jwt",
  },
  
  // 3. Providers (認証方法) の設定
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) : Promise<AuthUser | null>{
        // ... 認証処理の省略 ...
        const user = await prisma.user.findUnique({ where: { email: credentials!.email }, });
        if (!user || !user.hashedPassword) return null;
        const isMatch = await bcrypt.compare(credentials!.password, user.hashedPassword);

        if (isMatch) {
          return {
            id: user.id.toString(), // 💡 string型
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin, // 💡 ここで isAdmin を返す
          } as AuthUser;
        }
        return null;
      },
    }),
  ],

  // 💡 4. Callbacks (IDとisAdminをセッションに渡すために必須)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // authorizeから返された user の id/isAdmin を JWTトークンにコピー
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // JWTトークンの id/isAdmin を session.user にコピー
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },

  // 5. カスタムページの定義
  pages: {
    signIn: '/login',
  },

  // 6. 秘密鍵の設定
  secret: process.env.AUTH_SECRET,
};