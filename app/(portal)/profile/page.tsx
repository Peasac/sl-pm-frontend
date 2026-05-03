"use client";

import Link from "next/link";
import * as React from "react";
import { KeyRound, PencilLine, Save, Shield, UserCircle2 } from "lucide-react";

import { useAppContext } from "@/components/providers/AppProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "SL";

export default function ProfilePage() {
  const { user, projects, updateAuthAccountDetails, updateAuthAccountPassword } = useAppContext();
  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [isPasswordSaving, setIsPasswordSaving] = React.useState(false);
  const roleLabel = user?.role ?? "guest";

  React.useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setSaveMessage(null);
  }, [user]);

  const visibleProjects = React.useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "admin") {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.contacts.some(
          (contact) =>
            contact.email.toLowerCase() === user.email.toLowerCase() ||
            contact.name.toLowerCase() === user.name.toLowerCase()
        ) || project.clientAccess.email.toLowerCase() === user.email.toLowerCase()
    );
  }, [projects, user]);

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail) {
      setSaveMessage("Name and email are required.");
      return;
    }

    setIsSaving(true);
    updateAuthAccountDetails(user.email, {
      name: trimmedName,
      email: trimmedEmail,
      role: user.role,
    });
    setIsSaving(false);
    setSaveMessage("Profile saved.");
  };

  const handlePasswordChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setPasswordError(null);
    setIsPasswordSaving(true);
    updateAuthAccountPassword(user.email, password);
    setIsPasswordSaving(false);
    setPassword("");
    setConfirmPassword("");
    setPasswordDialogOpen(false);
  };

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-4 py-10 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
          <UserCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-semibold">Sign in to view your profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your profile, password, and project membership are available after login.
          </p>
          <Button asChild className="mt-6">
            <Link href="/login">Go to login</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-16 w-16 border border-border">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Badge variant="outline" className="capitalize">
                  {roleLabel}
                </Badge>
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleSaveProfile}>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="profile-name">
                  Name
                </label>
                <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="profile-email">
                  Email
                </label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="profile-role">
                  Role
                </label>
                <div
                  id="profile-role"
                  className="flex h-10 items-center rounded-md border border-border bg-secondary/30 px-3 text-sm text-muted-foreground capitalize"
                >
                  {roleLabel}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save profile"}
                </Button>
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <KeyRound className="h-4 w-4" />
                      Change password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change password</DialogTitle>
                      <DialogDescription>
                        Enter the new password twice to confirm the update.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={handlePasswordChange}>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium" htmlFor="new-password">
                          New password
                        </label>
                        <Input
                          id="new-password"
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium" htmlFor="confirm-password">
                          Confirm new password
                        </label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Re-enter new password"
                        />
                      </div>
                      {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isPasswordSaving}>
                          {isPasswordSaving ? "Updating..." : "Update password"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
            </form>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Project membership</h3>
                <p className="text-sm text-muted-foreground">
                  Projects available to your account across the portal.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {visibleProjects.length ? (
                visibleProjects.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-2xl border border-border bg-secondary/25 p-4 transition hover:border-foreground/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{project.summary.client}</p>
                        <p className="text-xs text-muted-foreground">{project.name}</p>
                      </div>
                      <Badge variant="outline">{project.summary.status}</Badge>
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between gap-4">
                        <dt>Location</dt>
                        <dd className="text-foreground">{project.summary.location}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt>Progress</dt>
                        <dd className="text-foreground">{project.summary.progress}%</dd>
                      </div>
                    </dl>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                  You are not assigned to any projects yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Quick links</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/overview">Overview</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tasks">Tasks</Link>
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
