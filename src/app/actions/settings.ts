"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { signOut } from "@/lib/auth";

export async function setLocale(locale: "ko" | "en") {
  const c = await cookies();
  c.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}
