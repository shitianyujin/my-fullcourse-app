import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// ユーザー登録処理 (POST /api/register)
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 1. パラメータのバリデーション
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'すべてのフィールドを入力してください。' },
        { status: 400 }
      );
    }
    
    // 2. 既存ユーザーのチェック
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に登録されています。' },
        { status: 409 } // Conflict
      );
    }
    
    // 3. パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 4. ユーザーをデータベースに作成
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword, // ハッシュ化されたパスワードを保存
      },
    });

    // 成功レスポンスを返す（パスワードは含めない）
    return NextResponse.json({ 
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      message: 'ユーザー登録が完了しました。'
    }, { status: 201 }); // Created

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'サーバー内部エラーが発生しました。' },
      { status: 500 }
    );
  }
}