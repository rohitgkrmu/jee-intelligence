"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Upload,
  BarChart2,
  Users,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/questions", label: "Questions", icon: FileText },
  { href: "/admin/diagnostic-items", label: "Diagnostic Items", icon: Sparkles },
  { href: "/admin/import", label: "Import Data", icon: Upload },
  { href: "/admin/insights", label: "Analytics", icon: BarChart2 },
  { href: "/admin/leads", label: "Leads", icon: Users },
];

interface SidebarContentProps {
  pathname: string;
  collapsed: boolean;
  setMobileOpen: (open: boolean) => void;
  handleLogout: () => void;
}

function SidebarContent({ pathname, collapsed, setMobileOpen, handleLogout }: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6 border-b border-[var(--border-dark)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--zenith-primary)] to-[var(--zenith-cyan)]">
          <span className="text-lg font-bold text-white">Z</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-[var(--text-primary)]">Admin Panel</span>
            <span className="text-[10px] text-[var(--text-muted)]">JEE Intelligence</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--zenith-primary)]/10 text-[var(--zenith-cyan)] border border-[var(--zenith-primary)]/20"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-[var(--border-dark)]">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--background-card)] border border-[var(--border-dark)] text-[var(--text-primary)]"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[var(--background-card)] border-r border-[var(--border-dark)]">
            <SidebarContent
              pathname={pathname}
              collapsed={false}
              setMobileOpen={setMobileOpen}
              handleLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-[var(--background-card)] border-r border-[var(--border-dark)] transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          setMobileOpen={setMobileOpen}
          handleLogout={handleLogout}
        />
        <button
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-[var(--background-elevated)] border border-[var(--border-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-4 w-4" />
        </button>
      </aside>
    </>
  );
}
