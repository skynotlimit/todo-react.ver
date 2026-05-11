import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { FortuneCookie } from "@/components/fortune-cookie";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar
        user={{
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        }}
      />
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </div>
      </main>
      <MobileBottomNav />
      <FortuneCookie userId={session.user.id} />
    </div>
  );
}
