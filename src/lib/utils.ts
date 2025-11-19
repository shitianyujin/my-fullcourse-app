// lib/utils.ts

/**
 * 平均評価スコアを整形する
 * nullの場合は '-' を、それ以外は小数点第1位で表示
 */
export function formatAverageRating(score: number | null): string {
    if (score === null || score === 0) {
        return '-';
    }
    // 小数点第1位に丸めて文字列として返す
    return score.toFixed(1);
}