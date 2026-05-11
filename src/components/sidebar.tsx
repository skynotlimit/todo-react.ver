"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar,
  CalendarClock,
  CheckCheck,
  Inbox,
  ListTodo,
  Settings,
  Tags,
  FolderTree,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  user: { name: string | null; email: string | null; image: string | null };
};

export function Sidebar({ user }: Props) {
  const t = useTranslations();
  const pathname = usePathname();

  const links = [
    { href: "/today", label: t("nav.today"), icon: Calendar },
    { href: "/upcoming", label: t("nav.upcoming"), icon: CalendarClock },
    { href: "/all", label: t("nav.all"), icon: Inbox },
    { href: "/routines", label: t("nav.routines"), icon: Repeat },
    { href: "/completed", label: t("nav.completed"), icon: CheckCheck },
  ] as const;

  const manage = [
    { href: "/categories", label: t("nav.categories"), icon: FolderTree },
    { href: "/tags", label: t("nav.tags"), icon: Tags },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ] as const;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/50">
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <ListTodo className="h-5 w-5" />
        <span className="font-semibold text-sm">{t("app.name")}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {links.map((l) => (
          <NavLink key={l.href} href={l.href} active={pathname === l.href}>
            <l.icon className="h-4 w-4" />
            {l.label}
          </NavLink>
        ))}
        <div className="pt-3 mt-3 border-t border-border space-y-1">
          {manage.map((l) => (
            <NavLink key={l.href} href={l.href} active={pathname === l.href}>
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-border flex items-center gap-3">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-8 w-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
            {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{user.name ?? "—"}</div>
          <div className="text-xs text-muted-foreground truncate">
            {user.email ?? ""}
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 h-9 rounded-md text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
    >
      {children}
    </Link>
  );
}
