import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/shared/ui";

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (session?.user) redirect("/today");

  const t = await getTranslations();
  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl ?? "/today";

  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo });
  }

  const hasGoogle =
    !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("app.name")}
          </h1>
          <p className="text-muted-foreground">{t("app.tagline")}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("auth.signInRequired")}
          </p>
          {hasGoogle ? (
            <form action={handleSignIn}>
              <Button type="submit" className="w-full">
                {t("auth.signInWithGoogle")}
              </Button>
            </form>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-muted px-4 py-6 text-xs text-muted-foreground space-y-2 text-left">
              <p className="font-medium text-foreground">
                Google OAuth가 설정되어 있지 않습니다.
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  Google Cloud Console에서 OAuth 2.0 Client ID 생성 (Web
                  application)
                </li>
                <li>
                  Authorized redirect URI:
                  <code className="block bg-background border border-border rounded px-1 py-0.5 mt-1 text-[10px]">
                    http://localhost:3000/api/auth/callback/google
                  </code>
                </li>
                <li>
                  <code>.env</code>의 <code>AUTH_GOOGLE_ID</code>,{" "}
                  <code>AUTH_GOOGLE_SECRET</code>에 채우고 서버 재시작
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
