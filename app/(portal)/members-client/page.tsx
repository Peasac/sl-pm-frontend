"use client";

import * as React from "react";

import { BadgeInfo, KeyRound, PencilLine, Plus, Star, Trash2, UserRound } from "lucide-react";

import { useAppContext } from "@/components/providers/AppProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientAccount, Contact } from "@/lib/types";

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "SL";

type SelectedAccount =
  | {
      kind: "member";
      account: Contact;
    }
  | {
      kind: "client";
      account: ClientAccount;
    };

export default function MembersClientPage() {
  const {
    clientAccounts,
    removeClientAccount,
    removeStarlinkMember,
    role,
    starlinkMembers,
    addClientAccount,
    addStarlinkMember,
    updateClientAccountDetails,
    updateClientAccountPassword,
    updateStarlinkMemberDetails,
    updateStarlinkMemberPassword,
  } = useAppContext();
  const [memberName, setMemberName] = React.useState("");
  const [memberRole, setMemberRole] = React.useState("");
  const [memberEmail, setMemberEmail] = React.useState("");
  const [memberPassword, setMemberPassword] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [clientPassword, setClientPassword] = React.useState("");
  const [memberError, setMemberError] = React.useState("");
  const [clientError, setClientError] = React.useState("");
  const [selectedAccount, setSelectedAccount] = React.useState<SelectedAccount | null>(null);
  const [editAccountOpen, setEditAccountOpen] = React.useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editRole, setEditRole] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editError, setEditError] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  if (role !== "admin") {
    return (
      <Card className="bg-card/80">
        <CardContent className="p-6 text-sm text-muted-foreground">
          This section is available to Starlink admins only.
        </CardContent>
      </Card>
    );
  }

  const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMemberError("");

    if (!memberName.trim() || !memberRole.trim() || !memberEmail.trim() || !memberPassword.trim()) {
      setMemberError("Fill in all member fields before adding.");
      return;
    }

    const normalizedEmail = memberEmail.trim().toLowerCase();
    if (starlinkMembers.some((member) => member.email.toLowerCase() === normalizedEmail)) {
      setMemberError("That member email already exists.");
      return;
    }
    if (clientAccounts.some((client) => client.email.toLowerCase() === normalizedEmail)) {
      setMemberError("That email is already used by a client.");
      return;
    }

    addStarlinkMember({
      name: memberName.trim(),
      role: memberRole.trim(),
      email: normalizedEmail,
      team: "Starlink Team",
      avatar: getInitials(memberName.trim()),
      password: memberPassword.trim(),
    });

    setMemberName("");
    setMemberRole("");
    setMemberEmail("");
    setMemberPassword("");
  };

  const handleAddClient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError("");

    if (!clientName.trim() || !clientEmail.trim() || !clientPassword.trim()) {
      setClientError("Fill in all client fields before adding.");
      return;
    }

    const normalizedEmail = clientEmail.trim().toLowerCase();
    if (clientAccounts.some((client) => client.email.toLowerCase() === normalizedEmail)) {
      setClientError("That client email already exists.");
      return;
    }
    if (starlinkMembers.some((member) => member.email.toLowerCase() === normalizedEmail)) {
      setClientError("That email is already used by a member.");
      return;
    }

    addClientAccount({
      name: clientName.trim(),
      role: "Client Contact",
      email: normalizedEmail,
      team: "Client Team",
      avatar: getInitials(clientName.trim()),
      password: clientPassword.trim(),
    });

    setClientName("");
    setClientEmail("");
    setClientPassword("");
  };

  const openMemberDetails = (account: Contact) => {
    setSelectedAccount({ kind: "member", account });
    setEditAccountOpen(false);
    setChangePasswordOpen(false);
    setEditName("");
    setEditRole("");
    setEditEmail("");
    setEditError("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const openClientDetails = (account: ClientAccount) => {
    setSelectedAccount({ kind: "client", account });
    setEditAccountOpen(false);
    setChangePasswordOpen(false);
    setEditName("");
    setEditRole("");
    setEditEmail("");
    setEditError("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const closeDetailDialog = (open: boolean) => {
    if (open) {
      return;
    }

    setSelectedAccount(null);
    setEditAccountOpen(false);
    setChangePasswordOpen(false);
    setEditName("");
    setEditRole("");
    setEditEmail("");
    setEditError("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const openEditAccountDialog = () => {
    if (!selectedAccount) {
      return;
    }

    setEditName(selectedAccount.account.name);
    setEditRole(selectedAccount.account.role);
    setEditEmail(selectedAccount.account.email);
    setEditError("");
    setChangePasswordOpen(false);
    setEditAccountOpen(true);
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAccount) {
      return;
    }

    const trimmedName = editName.trim();
    const trimmedRole = editRole.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();

    if (!trimmedName || !trimmedRole || !trimmedEmail) {
      setEditError("Fill in name, role, and email before saving.");
      return;
    }

    if (selectedAccount.kind === "client") {
      updateClientAccountDetails(selectedAccount.account.email, {
        name: trimmedName,
        role: trimmedRole,
        email: trimmedEmail,
      });
    } else {
      updateStarlinkMemberDetails(selectedAccount.account.email, {
        name: trimmedName,
        role: trimmedRole,
        email: trimmedEmail,
      });
    }

    setSelectedAccount((current) => {
      if (!current) {
        return current;
      }

      if (current.kind === "client") {
        return {
          kind: "client",
          account: {
            ...current.account,
            name: trimmedName,
            role: trimmedRole,
            email: trimmedEmail,
            avatar: getInitials(trimmedName),
          },
        };
      }

      return {
        kind: "member",
        account: {
          ...current.account,
          name: trimmedName,
          role: trimmedRole,
          email: trimmedEmail,
          avatar: getInitials(trimmedName),
        },
      };
    });
    setEditAccountOpen(false);
    setEditError("");
  };

  const handleDeleteSelectedAccount = () => {
    if (!selectedAccount) {
      return;
    }

    if (selectedAccount.kind === "client") {
      removeClientAccount(selectedAccount.account.email);
    } else {
      removeStarlinkMember(selectedAccount.account.email);
    }

    closeDetailDialog(false);
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAccount) {
      return;
    }

    const trimmedPassword = newPassword.trim();
    const trimmedConfirmation = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirmation) {
      setPasswordError("Enter the new password twice.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmation) {
      setPasswordError("The two passwords do not match.");
      return;
    }

    if (selectedAccount.kind === "client") {
      updateClientAccountPassword(selectedAccount.account.email, trimmedPassword);
    } else {
      updateStarlinkMemberPassword(selectedAccount.account.email, trimmedPassword);
    }

    setSelectedAccount((current) =>
      current
        ? {
            ...current,
            account: {
              ...current.account,
              password: trimmedPassword,
            },
          }
        : current
    );
    setChangePasswordOpen(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const selectedAccountName = selectedAccount?.account.name ?? "";
  const selectedAccountTeam = selectedAccount?.account.team ?? "";
  const selectedAccountSource =
    selectedAccount?.kind === "client"
      ? selectedAccount.account.sourceProjectId
        ? "Project linked"
        : "Manual"
      : "Starlink directory";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 reveal-up">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin directory</p>
          <h1 className="text-3xl font-semibold">Members&Client</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            View the company member accounts and the client accounts currently available in the portal.
          </p>
        </div>
        <Badge variant="primary">Admin only</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-card/80 reveal-up reveal-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4" />
              Starlink Members
            </CardTitle>
            <CardDescription>Internal company accounts attached to projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {starlinkMembers.map((member) => (
                <button
                  key={member.email}
                  type="button"
                  onClick={() => openMemberDetails(member)}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border bg-secondary/25 p-4 text-left transition hover:border-primary/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback>{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{member.name}</p>
                      <Badge variant="outline">Member</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{member.role}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant="outline" className="group-hover:border-primary/50">
                    {member.avatar}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/80 reveal-up reveal-delay-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="h-4 w-4" />
                Client Accounts
              </CardTitle>
              <CardDescription>
                Accounts that can be selected inside Add Project, including newly created clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientAccounts.length ? (
                clientAccounts.map((client) => (
                  <button
                    key={client.email}
                    type="button"
                    onClick={() => openClientDetails(client)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border bg-secondary/25 p-4 text-left transition hover:border-primary/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback>{client.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{client.name}</p>
                        <Badge variant="outline">
                          {client.sourceProjectId ? "Project" : "Manual"}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{client.role}</p>
                      <p className="truncate text-xs text-muted-foreground">{client.email}</p>
                    </div>
                    <Badge variant="outline" className="group-hover:border-primary/50">
                      {client.avatar}
                    </Badge>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No client accounts available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" />
                Add Starlink Member
              </CardTitle>
              <CardDescription>Create a new internal member account for the Starlink side.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAddMember}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="member-name">Name</Label>
                    <Input
                      id="member-name"
                      value={memberName}
                      onChange={(event) => setMemberName(event.target.value)}
                      placeholder="Elena Pierce"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-role">Role</Label>
                    <Input
                      id="member-role"
                      value={memberRole}
                      onChange={(event) => setMemberRole(event.target.value)}
                      placeholder="Field Ops Lead"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="member-email">Email</Label>
                    <Input
                      id="member-email"
                      type="email"
                      value={memberEmail}
                      onChange={(event) => setMemberEmail(event.target.value)}
                      placeholder="name@starlink.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="member-password">Password</Label>
                    <Input
                      id="member-password"
                      type="password"
                      value={memberPassword}
                      onChange={(event) => setMemberPassword(event.target.value)}
                      placeholder="Temporary password"
                    />
                  </div>
                </div>
                {memberError && (
                  <p className="text-sm text-red-400">{memberError}</p>
                )}
                <Button type="submit">Add member</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" />
                Add Client Account
              </CardTitle>
              <CardDescription>Create a new client account that can be selected in Add Project.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAddClient}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="client-name">Client name</Label>
                    <Input
                      id="client-name"
                      value={clientName}
                      onChange={(event) => setClientName(event.target.value)}
                      placeholder="Client contact or company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Client email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={clientEmail}
                      onChange={(event) => setClientEmail(event.target.value)}
                      placeholder="client@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password">Client password</Label>
                    <Input
                      id="client-password"
                      type="password"
                      value={clientPassword}
                      onChange={(event) => setClientPassword(event.target.value)}
                      placeholder="Temporary password"
                    />
                  </div>
                </div>
                {clientError && (
                  <p className="text-sm text-red-400">{clientError}</p>
                )}
                <Button type="submit">Add client</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Dialog open={Boolean(selectedAccount)} onOpenChange={closeDetailDialog}>
          <DialogContent className="max-w-2xl">
            {selectedAccount ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{selectedAccount.account.avatar}</AvatarFallback>
                    </Avatar>
                    <span>{selectedAccountName}</span>
                  </DialogTitle>
                  <DialogDescription>
                    Review account information, change the password, or remove the account.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-secondary/25 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                    <p className="mt-1 text-sm font-medium">{selectedAccount.account.role}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/25 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Team</p>
                    <p className="mt-1 text-sm font-medium">{selectedAccountTeam}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/25 p-4 md:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="mt-1 text-sm font-medium">{selectedAccount.account.email}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/25 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Account source</p>
                    <p className="mt-1 text-sm font-medium">{selectedAccountSource}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/25 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Password</p>
                    <p className="mt-1 text-sm font-medium">
                      {selectedAccount.account.password ? "Stored in portal" : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={openEditAccountDialog}>
                    <PencilLine className="h-4 w-4" />
                    Edit account
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    <KeyRound className="h-4 w-4" />
                    Change password
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDeleteSelectedAccount}>
                    <Trash2 className="h-4 w-4" />
                    Delete account
                  </Button>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={editAccountOpen && Boolean(selectedAccount)} onOpenChange={setEditAccountOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PencilLine className="h-4 w-4" />
                Edit account
              </DialogTitle>
              <DialogDescription>
                Update the name, role, and email for {selectedAccountName}.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(event) => {
                    setEditName(event.target.value);
                    setEditError("");
                  }}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Input
                  id="edit-role"
                  value={editRole}
                  onChange={(event) => {
                    setEditRole(event.target.value);
                    setEditError("");
                  }}
                  placeholder="Account role"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(event) => {
                    setEditEmail(event.target.value);
                    setEditError("");
                  }}
                  placeholder="name@example.com"
                />
              </div>
              {editError ? <p className="text-sm text-red-500">{editError}</p> : null}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditAccountOpen(false);
                    setEditError("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={changePasswordOpen && Boolean(selectedAccount)} onOpenChange={setChangePasswordOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BadgeInfo className="h-4 w-4" />
                Change password
              </DialogTitle>
              <DialogDescription>
                Enter the new password twice for {selectedAccountName}.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
              {passwordError ? <p className="text-sm text-red-500">{passwordError}</p> : null}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save password</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }