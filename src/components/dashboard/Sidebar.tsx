"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  ChevronDown,
  X,
  Settings,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { SidebarData } from "@/lib/db/collections";
import type { SidebarUser } from "@/components/dashboard/DashboardShell";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

function getTypeSlug(name: string) {
  return name.toLowerCase() + "s";
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  data: SidebarData;
  user: SidebarUser | null;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  data,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { itemTypes, favoriteCollections, recentCollections } = data;

  const displayName = user?.name ?? "Guest";
  const displayEmail = user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-2">
        {/* Sidebar header row */}
        <div className="flex items-center justify-between px-3 pb-1">
          {!collapsed && (
            <span className="text-sidebar-foreground/50 text-xs font-medium">
              Navigation
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "mx-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Types section */}
        <div className="px-2">
          <button
            onClick={() => setTypesOpen((o) => !o)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors",
              "text-sidebar-foreground/50 text-xs font-medium",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "mx-auto h-9 w-9 justify-center px-0"
            )}
          >
            {!collapsed && <span>Types</span>}
            {!collapsed && (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-150",
                  !typesOpen && "-rotate-90"
                )}
              />
            )}
          </button>

          {typesOpen && (
            <nav className="mt-0.5 space-y-0.5">
              {itemTypes.map((type) => {
                const Icon = ICON_MAP[type.icon] ?? File;
                const slug = getTypeSlug(type.name);
                const href = `/items/${slug}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={type.id}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80",
                      collapsed && "mx-auto h-9 w-9 justify-center px-0"
                    )}
                    title={collapsed ? type.name : undefined}
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center"
                      style={{ color: type.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{type.name}</span>
                        {(type.name.toLowerCase() === "file" ||
                          type.name.toLowerCase() === "image") && (
                          <Badge className="h-4 border-0 bg-amber-500/15 px-1 text-[10px] font-semibold text-amber-400 hover:bg-amber-500/15">
                            PRO
                          </Badge>
                        )}
                        <span className="text-sidebar-foreground/40 text-xs">
                          {type.count}
                        </span>
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Collections section */}
        <div className="mt-3 px-2">
          <button
            onClick={() => setCollectionsOpen((o) => !o)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors",
              "text-sidebar-foreground/50 text-xs font-medium",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "mx-auto h-9 w-9 justify-center px-0"
            )}
          >
            {!collapsed && <span>Collections</span>}
            {!collapsed && (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-150",
                  !collectionsOpen && "-rotate-90"
                )}
              />
            )}
          </button>

          {collectionsOpen && !collapsed && (
            <>
              {/* Favorites subsection */}
              {favoriteCollections.length > 0 && (
                <>
                  <p className="text-sidebar-foreground/35 mt-2 px-2 pb-1 text-[10px] font-semibold tracking-widest uppercase">
                    Favorites
                  </p>
                  <nav className="space-y-0.5">
                    {favoriteCollections.map((col) => {
                      const href = `/collections/${col.id}`;
                      const isActive = pathname === href;
                      return (
                        <Link
                          key={col.id}
                          href={href}
                          className={cn(
                            "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80"
                          )}
                        >
                          <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                          <span className="flex-1 truncate">{col.name}</span>
                          <button
                            className="hover:text-sidebar-foreground rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            aria-label="Remove from favorites"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Link>
                      );
                    })}
                  </nav>
                </>
              )}

              {/* Recent collections subsection */}
              {recentCollections.length > 0 && (
                <>
                  <p className="text-sidebar-foreground/35 mt-3 px-2 pb-1 text-[10px] font-semibold tracking-widest uppercase">
                    Recent
                  </p>
                  <nav className="space-y-0.5">
                    {recentCollections.map((col) => {
                      const href = `/collections/${col.id}`;
                      const isActive = pathname === href;
                      return (
                        <Link
                          key={col.id}
                          href={href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80"
                          )}
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                col.dominantType?.color ?? "#6b7280",
                            }}
                          />
                          <span className="flex-1 truncate">{col.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </>
              )}

              {/* View all collections link */}
              <Link
                href="/collections"
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground mt-3 flex items-center px-2 py-1.5 text-xs transition-colors"
              >
                View all collections
              </Link>
            </>
          )}
        </div>
      </div>

      {/* User avatar */}
      <div className="border-sidebar-border relative shrink-0 border-t p-2">
        {/* Sign-out dropdown */}
        {userMenuOpen && !collapsed && (
          <div className="border-border bg-card absolute bottom-full left-2 right-2 mb-1 rounded-lg border shadow-lg">
            <Link
              href="/profile"
              onClick={() => setUserMenuOpen(false)}
              className="hover:bg-accent text-foreground flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm"
            >
              <Settings className="h-3.5 w-3.5" />
              Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="hover:bg-accent text-foreground flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-sm"
            >
              <X className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}

        <div
          onClick={() => setUserMenuOpen((o) => !o)}
          className={cn(
            "hover:bg-sidebar-accent flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
            collapsed && "mx-auto h-9 w-9 justify-center px-0"
          )}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={displayName}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-foreground truncate text-sm font-medium leading-tight">
                {displayName}
              </p>
              <p className="text-sidebar-foreground/50 truncate text-xs leading-none">
                {displayEmail}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-sidebar-border hidden flex-col border-r md:flex",
          "overflow-hidden transition-[width] duration-200",
          collapsed ? "w-14" : "w-52"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside className="bg-sidebar border-sidebar-border fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r md:hidden">
            <div className="border-sidebar-border flex h-14 shrink-0 items-center justify-between border-b px-4">
              <span className="text-sidebar-foreground text-sm font-semibold">
                Menu
              </span>
              <button
                onClick={onMobileClose}
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground p-1 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
