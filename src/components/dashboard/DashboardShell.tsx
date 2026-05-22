"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { SidebarData } from "@/lib/db/collections";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
}

export function DashboardShell({ children, sidebarData }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <header className="border-border flex h-14 shrink-0 items-center border-b px-4">
        <div className="flex shrink-0 items-center gap-2">
          <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-md">
            <Package className="text-primary-foreground h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">DevStash</span>
        </div>

        <div className="flex flex-1 justify-center px-4">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search items..."
              className="bg-muted h-8 border-0 pl-9 text-sm"
            />
            <kbd className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs select-none">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 gap-1.5 text-xs sm:flex"
          >
            New Collection
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Item
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          data={sidebarData}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
