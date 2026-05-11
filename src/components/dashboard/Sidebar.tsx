'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { mockItemTypes, mockCollections, mockUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
}

function getTypeSlug(name: string) {
  return name.toLowerCase() + 's'
}

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [typesOpen, setTypesOpen] = useState(true)
  const [collectionsOpen, setCollectionsOpen] = useState(true)

  const favoriteCollections = mockCollections.filter((c) => c.isFavorite)
  const otherCollections = mockCollections.filter((c) => !c.isFavorite)

  const initials = mockUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto py-2">

        {/* Sidebar header row */}
        <div className="flex items-center justify-between px-3 pb-1">
          {!collapsed && (
            <span className="text-xs font-medium text-sidebar-foreground/50">Navigation</span>
          )}
          <button
            onClick={onToggleCollapse}
            className={cn(
              'flex items-center justify-center h-7 w-7 rounded-md transition-colors',
              'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              collapsed && 'mx-auto'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Types section */}
        <div className="px-2">
          <button
            onClick={() => setTypesOpen((o) => !o)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors',
              'text-xs font-medium text-sidebar-foreground/50',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-0 w-9 h-9 mx-auto'
            )}
          >
            {!collapsed && <span>Types</span>}
            {!collapsed && (
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform duration-150', !typesOpen && '-rotate-90')}
              />
            )}
          </button>

          {typesOpen && (
            <nav className="mt-0.5 space-y-0.5">
              {mockItemTypes.map((type) => {
                const Icon = ICON_MAP[type.icon] ?? File
                const slug = getTypeSlug(type.name)
                const href = `/items/${slug}`
                const isActive = pathname === href
                return (
                  <Link
                    key={type.id}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/80',
                      collapsed && 'justify-center px-0 w-9 h-9 mx-auto'
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
                        <span className="text-xs text-sidebar-foreground/40">{type.count}</span>
                      </>
                    )}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        {/* Collections section */}
        <div className="mt-3 px-2">
          <button
            onClick={() => setCollectionsOpen((o) => !o)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors',
              'text-xs font-medium text-sidebar-foreground/50',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-0 w-9 h-9 mx-auto'
            )}
          >
            {!collapsed && <span>Collections</span>}
            {!collapsed && (
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform duration-150', !collectionsOpen && '-rotate-90')}
              />
            )}
          </button>

          {collectionsOpen && !collapsed && (
            <>
              {/* Favorites subsection */}
              {favoriteCollections.length > 0 && (
                <>
                  <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
                    Favorites
                  </p>
                  <nav className="space-y-0.5">
                    {favoriteCollections.map((col) => {
                      const href = `/collections/${col.id}`
                      const isActive = pathname === href
                      return (
                        <Link
                          key={col.id}
                          href={href}
                          className={cn(
                            'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/80'
                          )}
                        >
                          <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                          <span className="flex-1 truncate">{col.name}</span>
                          <button
                            className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-opacity hover:text-sidebar-foreground"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            aria-label="Remove from favorites"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Link>
                      )
                    })}
                  </nav>
                </>
              )}

              {/* All Collections subsection */}
              {otherCollections.length > 0 && (
                <>
                  <p className="mt-3 px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
                    All Collections
                  </p>
                  <nav className="space-y-0.5">
                    {otherCollections.map((col) => {
                      const href = `/collections/${col.id}`
                      const isActive = pathname === href
                      return (
                        <Link
                          key={col.id}
                          href={href}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/80'
                          )}
                        >
                          <span className="flex-1 truncate">{col.name}</span>
                          <span className="text-xs text-sidebar-foreground/40">{col.itemCount}</span>
                        </Link>
                      )
                    })}
                  </nav>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* User avatar */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2 py-1.5 cursor-pointer transition-colors hover:bg-sidebar-accent',
            collapsed && 'justify-center px-0'
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{mockUser.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{mockUser.email}</p>
              </div>
              <button
                className="p-1 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-sidebar border-r border-sidebar-border',
          'transition-[width] duration-200 overflow-hidden',
          collapsed ? 'w-14' : 'w-52'
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
          <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border md:hidden">
            <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-sidebar-border">
              <span className="font-semibold text-sm text-sidebar-foreground">Menu</span>
              <button
                onClick={onMobileClose}
                className="p-1 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
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
  )
}
