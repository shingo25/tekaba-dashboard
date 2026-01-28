import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie, removeAuthCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "パスワードが必要です" },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 401 }
      );
    }

    await setAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "認証処理に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await removeAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "ログアウト処理に失敗しました" },
      { status: 500 }
    );
  }
}
