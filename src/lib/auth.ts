// src/lib/auth.ts
import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { User as AuthUser } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // 1. Magic Link (Email) Provider
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
    // 💡 triggerとsession引数を追加して更新を検知できるようにする
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }

      // 💡 プロフィール更新(update)が呼ばれたら、トークンの情報を書き換える
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image; // NextAuthでは画像は picture プロパティに入ります
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        
        // 💡 更新されたトークン情報をセッションに反映
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
};