// app/admin/actions.ts
'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { SubmissionStatus } from "@prisma/client";

// ステータスを更新するアクション
export async function updateSubmissionStatus(id: number, newStatus: SubmissionStatus) {
  const session = await getServerSession(authOptions);

  // 管理者チェック
  if (!session || !(session.user as any).isAdmin) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.contactSubmission.update({
      where: { id },
      data: { status: newStatus },
    });

    // 画面のデータを更新
    revalidatePath("/admin/contacts");
    revalidatePath("/admin/requests");
    revalidatePath("/admin"); // ダッシュボードの件数も更新
    
    return { success: true };
  } catch (error) {
    console.error("Status update failed:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}

// ユーザー削除アクション
export async function deleteUser(userId: number) {
  const session = await getServerSession(authOptions);

  // 管理者チェック
  if (!session || !(session.user as any).isAdmin) {
    throw new Error("Unauthorized");
  }

  // 自分自身を削除しようとしていないかチェック
  // session.user.id は string なので number に変換して比較
  const currentUserId = parseInt((session.user as any).id);
  if (userId === currentUserId) {
    return { success: false, error: "自分自身は削除できません" };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin"); // ダッシュボードの件数更新
    return { success: true };
  } catch (error) {
    console.error("User delete failed:", error);
    return { success: false, error: "削除に失敗しました" };
  }
}

// コメント削除アクション
export async function deleteComment(commentId: number) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isAdmin) {
    throw new Error("Unauthorized");
  }

  try {
    // 削除する前に、紐付いているコースIDを取得しておく
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { courseId: true }
    });

    if (!comment) {
      return { success: false, error: "コメントが見つかりません" };
    }

    // トランザクションで「コメント削除」と「件数更新」を同時に行う
    await prisma.$transaction(async (tx) => {
      // 1. コメント削除
      await tx.comment.delete({
        where: { id: commentId },
      });

      // 2. コースのコメント数を1減らす
      await tx.course.update({
        where: { id: comment.courseId },
        data: { commentCount: { decrement: 1 } },
      });
    });

    revalidatePath("/admin/comments");
    revalidatePath("/admin"); 
    return { success: true };
  } catch (error) {
    console.error("Comment delete failed:", error);
    return { success: false, error: "削除に失敗しました" };
  }
}

// ユーザー権限切り替え (一般 ↔ 管理者)
export async function toggleUserRole(userId: number) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isAdmin) {
    throw new Error("Unauthorized");
  }

  const currentUserId = parseInt((session.user as any).id);

  // 安全策: 自分自身の権限は変更できないようにする
  if (userId === currentUserId) {
    return { success: false, error: "自分自身の権限は変更できません" };
  }

  try {
    // 現在のユーザー情報を取得して、逆の状態にする
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (!user) {
      return { success: false, error: "ユーザーが見つかりません" };
    }

    const newIsAdmin = !user.isAdmin;

    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: newIsAdmin },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Role toggle failed:", error);
    return { success: false, error: "権限の変更に失敗しました" };
  }
}