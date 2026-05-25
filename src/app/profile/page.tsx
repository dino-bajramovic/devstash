import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileUser, getProfileStats } from "@/lib/db/profile";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountDialog } from "./delete-account-dialog";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link,
  File,
  Image,
  Layers,
  Hash,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  Snippet: Code,
  Prompt: Sparkles,
  Command: Terminal,
  Note: StickyNote,
  Link: Link,
  File: File,
  Image: Image,
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [user, stats] = await Promise.all([
    getProfileUser(session.user.id),
    getProfileStats(session.user.id),
  ]);

  if (!user) redirect("/sign-in");

  const displayName = user.name ?? user.email;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your account details and usage stats
        </p>
      </div>

      {/* User info */}
      <div className="border-border bg-card rounded-lg border p-6">
        <div className="flex items-center gap-4">
          <UserAvatar name={displayName} image={user.image} className="h-14 w-14 text-base" />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              {user.name ?? "—"}
            </p>
            <p className="text-muted-foreground truncate text-sm">{user.email}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Joined{" "}
              {user.createdAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Usage stats */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Usage</h2>
        <div className="border-border bg-card rounded-lg border">
          {/* Totals row */}
          <div className="border-border grid grid-cols-2 divide-x border-b">
            <div className="flex items-center gap-3 p-4">
              <Hash className="text-muted-foreground h-4 w-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Total Items</p>
                <p className="text-xl font-bold">{stats.totalItems}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Layers className="text-muted-foreground h-4 w-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Collections</p>
                <p className="text-xl font-bold">{stats.totalCollections}</p>
              </div>
            </div>
          </div>

          {/* Per-type breakdown */}
          <div className="divide-border divide-y">
            {stats.byType.map((t) => {
              const Icon = TYPE_ICONS[t.name] ?? File;
              return (
                <div key={t.name} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: t.color }} />
                    <span className="text-sm">{t.name}</span>
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">
                    {t.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Account actions */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Account</h2>
        <div className="space-y-4">
          {user.hasPassword && <ChangePasswordForm />}
          <DeleteAccountDialog />
        </div>
      </section>
    </div>
  );
}