// src/lib/auth.ts
import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { User as AuthUser } from "next-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      // ここでResendを使ってメールを送る処理を上書きします
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);
        
        try {
          await resend.emails.send({
            from: provider.from as string,
            to: identifier,
            subject: `【おれふる】ログイン用リンク`,
            text: `おれふるにログインするには、以下のリンクをクリックしてください。\n\n${url}\n\n`,
            // HTMLメールのデザイン（簡易版）
            html: `
              <body style="background: #f9f9f9; padding: 20px; font-family: sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; text-align: center; border: 1px solid #eee;">
                  <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">おれふるへようこそ</h1>
                  <p style="color: #666; margin-bottom: 30px;">
                    以下のボタンをクリックしてログインを完了してください。<br>
                    冷凍食品のフルコースをシェアしましょう！
                  </p>
                  <a href="${url}" style="display: inline-block; background: #0070f3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">
                    ログインする
                  </a>
                  <p style="color: #999; font-size: 12px; margin-top: 40px;">
                    もしこのメールに心当たりがない場合は、無視していただいて構いません。
                  </p>
                </div>
              </body>
            `,
          });
        } catch (error) {
          console.error("Resend error:", error);
          throw new Error("メールの送信に失敗しました。");
        }
      },
    }),

    // Password Provider (メイン)
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

        // ユーザーがいない、またはパスワード未設定の場合
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
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