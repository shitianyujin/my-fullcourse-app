// app/api/auth/send-otp/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'メールアドレスが必要です' }, { status: 400 });
    }

    // 既に登録済みのメールアドレスかチェック（新規登録用なので）
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'このメールアドレスは既に登録されています' }, { status: 409 });
    }

    // 6桁のランダムな数字を生成
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 有効期限を10分後に設定
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // DBに保存（upsert: 既存があれば更新、なければ作成）
    await prisma.emailVerificationCode.upsert({
      where: { email },
      update: { code, expiresAt },
      create: { email, code, expiresAt },
    });

    // Resendでメール送信
    // Resendでメール送信
    await resend.emails.send({
      from: 'おれふる <no-reply@orefull.com>',
      to: email,
      subject: '【おれふる】認証コードをご確認ください',
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>認証コードのお知らせ</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <!-- ヘッダー -->
            <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">おれふる</h1>
            </div>

            <!-- 本文 -->
            <div style="padding: 32px 24px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
                おれふるをご利用いただきありがとうございます。<br>
                以下の認証コードを入力して、登録手続きを完了してください。
              </p>

              <!-- 認証コード表示エリア -->
              <div style="background-color: #f3f4f6; border-radius: 6px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937;">${code}</span>
              </div>

              <p style="margin: 0 0 16px; font-size: 14px; color: #666666;">
                ※このコードの有効期限は<strong>10分間</strong>です。<br>
                ※このメールに心当たりがない場合は、無視して削除してください。
              </p>
            </div>

            <!-- フッター -->
            <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © 2025 Orefull. All rights reserved.<br>
                このメールは送信専用アドレスから送信されています。
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ message: '認証コードを送信しました' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 });
  }
}