// src/lib/auth.ts
import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email"; // 💡 追加
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { User as AuthUser } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // 💡 1. Magic Link (Email) Provider
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),

    // 2. Password Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // ユーザーがいない、またはパスワード未設定（Magic Linkのみで登録済み）の場合
        if (!user || !user.hashedPassword) {
            return null;
        }

        const isMatch = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (isMatch) {
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin,
          } as AuthUser;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    // verifyRequest: '/auth/verify-request', // メール送信後の案内画面を作りたい場合はここを設定
  },
  secret: process.env.AUTH_SECRET,
};