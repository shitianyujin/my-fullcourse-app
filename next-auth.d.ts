// next-auth.d.ts (プロジェクトルート)

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
    }
  }

  interface JWT {
    id: string;
    isAdmin: boolean;
  }
  
  // Auth.jsのPrismaAdapterを利用する場合、User型の拡張は必須ではないが、
  // authorize関数の戻り値で型チェックを通すため定義しておく
  interface User {
    id: string;
    isAdmin: boolean;
  }
}