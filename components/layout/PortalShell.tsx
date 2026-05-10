"use client";

import * as React from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ForcePasswordChangeDialog } from "@/components/layout/ForcePasswordChangeDialog";

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="lg:pl-65">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <Topbar />
          <main className="flex-1 px-4 pb-12 pt-6 lg:px-8">{children}</main>
        </div>
      </div>
      <ForcePasswordChangeDialog />
    </div>
  );
}
