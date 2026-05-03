"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavItems, portalNavItems } from "@/components/layout/navigation";
import { useAppContext } from "@/components/providers/AppProvider";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAppContext();

  return (
    <aside className="hidden fixed inset-y-0 left-0 z-30 h-screen w-[260px] flex-col overflow-y-auto border-r border-border bg-card/60 px-6 py-8 lg:flex">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/Group 7.svg"
            alt="Starlink"
            width={140}
            height={31}
            className="h-[31px] w-auto"
            priority
          />
        </div>
        {/* <Badge variant={role === "admin" ? "primary" : "outline"}>{roleLabel}</Badge> */}
      </div>

      <div className="mt-8 space-y-1">
        {portalNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground",
                isActive && "bg-secondary/80 text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {role === "admin" && (
        <div className="mt-6 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground",
                  isActive && "bg-secondary/80 text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

    </aside>
  );
}
