"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogIn, Bell } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { portalNavItems } from "@/components/layout/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useAppContext } from "@/components/providers/AppProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const titleMap: Record<string, string> = {
  "/overview": "Overview",
  "/tasks": "Tasks",
  "/photos": "Photos",
  "/profile": "Profile",
};

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "SL";

function ProfileMenu() {
  const { user, role, projects, setUser } = useAppContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      setMenuStyle(null);
      return;
    }

    const btn = buttonRef.current;
    if (!btn) return;

    const updatePosition = () => {
      const rect = btn.getBoundingClientRect();
      const menuWidth = 256; // matches w-64
      let left = rect.right - menuWidth;
      if (left < 8) left = rect.left;
      const top = rect.bottom + 8;
      setMenuStyle({ position: "fixed", left: Math.round(left), top: Math.round(top), width: menuWidth, zIndex: 9999 });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <Button asChild variant="secondary" size="sm">
        <Link href="/login">
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </Button>
    );
  }

  const currentUserProjects =
    role === "admin"
      ? projects
      : projects.filter((project) =>
          project.contacts.some(
            (contact) =>
              contact.email.toLowerCase() === user.email.toLowerCase() ||
              contact.name.toLowerCase() === user.name.toLowerCase()
          ) ||
          project.clientAccess.some(
            (client) => client.email.toLowerCase() === user.email.toLowerCase()
          )
        );

  const menu = (
    <div ref={menuRef} className="rounded-2xl border border-border bg-card shadow-lg" style={{ width: "100%" }}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
            <Badge variant="outline" className="capitalize mt-1">{role}</Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Projects</p>
            <p className="mt-1 text-foreground font-medium">{currentUserProjects.length} assigned</p>
          </div>
        </div>

        <div className="border-t border-border pt-3 flex flex-col gap-2">
          <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
            <Link href="/profile">Profile</Link>
          </Button>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => {
              setIsOpen(false);
              window.localStorage.removeItem("slpm:token");
              window.localStorage.removeItem("slpm:user");
              setUser(null);
              window.location.href = "/login";
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="inline-flex items-center gap-2 h-11 rounded-full border border-border bg-card px-3 text-sm hover:bg-secondary/80 transition"
      >
        <Avatar className="h-7 w-7">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline">{user.name}</span>
        <ChevronDown className="h-4 w-4 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {isOpen && menuStyle && createPortal(
        <div style={menuStyle}>
          <div style={{ width: menuStyle.width }}>{menu}</div>
        </div>,
        document.body
      )}
    </div>
  );
}

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, refresh } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [panelStyle, setPanelStyle] = React.useState<React.CSSProperties | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      setPanelStyle(null);
      return;
    }

    const button = buttonRef.current;
    if (!button) return;

    const updatePosition = () => {
      const rect = button.getBoundingClientRect();
      const width = 360;
      let left = rect.right - width;
      if (left < 8) left = rect.left;
      setPanelStyle({
        position: "fixed",
        top: Math.round(rect.bottom + 10),
        left: Math.round(left),
        width,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const panel = (
    <div ref={panelRef} className="rounded-2xl border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => {
          setIsOpen(false);
          refresh();
        }}>
          Refresh
        </Button>
      </div>

      <div className="max-h-105 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={async () => {
                  await markAsRead(notification._id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 transition hover:bg-secondary/50",
                  !notification.isRead && "bg-secondary/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition hover:bg-secondary/80"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && panelStyle && createPortal(
        <div style={panelStyle}>
          {panel}
        </div>,
        document.body
      )}
    </div>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const { user, role, projects, activeProjectId, setActiveProjectId } = useAppContext();
  const roleLabel = role === "admin" ? "Admin" : role === "member" ? "Member" : "Client";
  const isUtilityPage = pathname.startsWith("/projects/new") || pathname.startsWith("/members-client");
  const activeProject =
    projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null;

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background/60 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Project Management</p>
          <h1 className="text-xl font-semibold">{titleMap[pathname] ?? "Portal"}</h1>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <ProfileMenu />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {role === "admin" ? (
          <div className="w-full max-w-xs">
            <Select value={activeProject?.id ?? ""} onValueChange={setActiveProjectId}>
              <SelectTrigger className="bg-card/70">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                     {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="w-full max-w-xs rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-muted-foreground">
            {activeProject
              ? `${activeProject.name}`
              : "Project"}
          </div>
        )}
      </div>

      {isUtilityPage ? null : (
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {portalNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition",
                  isActive && "bg-secondary/80 text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
