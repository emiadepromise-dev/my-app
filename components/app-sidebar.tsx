"use client";

import { Shield } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";

export function AppSidebar() {
  return (
    <aside className="flex flex-col w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground h-screen">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <Shield className="size-6 text-sidebar-primary" />
        <div>
          <div className="text-sm font-bold tracking-tight">CYBERYOSHI</div>
          <div className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
            Cybersecurity Toolkit
          </div>
        </div>
      </div>
      <SidebarNav />
    </aside>
  );
}
