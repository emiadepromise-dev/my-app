"use client";

import { Shield } from "lucide-react";
import { useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";

export function AppSidebar() {
  const [logoError, setLogoError] = useState(false);

  return (
    <aside className="flex flex-col w-64 h-screen border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 overflow-hidden">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="CyberYoshi logo"
              className="size-10 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <Shield className="size-5 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight text-foreground">
            CYBERYOSHI
          </div>
          <div className="text-[10px] text-primary/70 uppercase tracking-widest font-medium">
            Security Toolkit
          </div>
        </div>
      </div>
      <SidebarNav />
    </aside>
  );
}
