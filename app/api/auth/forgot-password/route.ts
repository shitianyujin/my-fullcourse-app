// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    
    // セキュリティ対策: ユーザーが存在しなくても「送信しました」と返すのが一般的
    // (存在しないメアドかどうかの総当たり攻撃を防ぐため)
    if (!user) {
      return NextResponse.json({ message: 'リセットメールを送信しました' });
    }

    // トークン生成
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24時間有効

    // DBに保存
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // リセット用URLの作成
    // 本番環境のURLを取得 (env.NEXTAUTH_URL が設定されている前提)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Resendでメール送信
    await resend.emails.send({
      from: 'おれふる <no-reply@orefull.com>',
      to: email,
      subject: '【おれふる】パスワードの再設定',
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <body style="font-family: sans-serif; background-color: #f4f4f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 24px; border-radius: 8px;">
            <h2 style="color: #333; margin-top: 0;">パスワード再設定のご案内</h2>
            <p>おれふるをご利用いただきありがとうございます。<br>
            以下のボタンをクリックして、新しいパスワードを設定してください。</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                パスワードを再設定する
              </a>
            </div>

            <p style="font-size: 14px; color: #666;">
              ※リンクの有効期限は24時間です。<br>
              ※もしボタンがクリックできない場合は、以下のURLをブラウザに貼り付けてください。<br>
              <a href="${resetLink}" style="color: #4f46e5;">${resetLink}</a>
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
              心当たりがない場合は、このメールを削除してください。
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ message: 'リセットメールを送信しました' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 });
  }
}