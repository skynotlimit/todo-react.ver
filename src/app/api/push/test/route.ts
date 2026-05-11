import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  await sendPushToUser(session.user.id, {
    title: "데일리 투두",
    body: "푸시 알림이 정상 작동합니다 🎉",
    url: "/today",
  });
  return NextResponse.json({ ok: true });
}
