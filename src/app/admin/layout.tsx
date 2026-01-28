"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--background-dark)]">
      <AdminSidebar />
      <div className="lg:ml-64 min-h-screen">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
