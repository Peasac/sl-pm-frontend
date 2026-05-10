"use client";

import * as React from "react";
import { Users, Plus, Trash2 } from "lucide-react";

import { useAppContext } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProjectClients() {
  const { role, project, clientAccounts, updateProjectDetails } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const [selectedClientId, setSelectedClientId] = React.useState("");

  if (role !== "admin") return null;

  const assigned = new Set((project?.clientAccess ?? []).map((c) => c.email.toLowerCase()));
  const available = clientAccounts.filter((a) => !assigned.has(a.email.toLowerCase()));

  React.useEffect(() => {
    if (open && !selectedClientId && available[0]) setSelectedClientId(available[0].id);
  }, [open, available, selectedClientId]);

  const handleAdd = async () => {
    if (!project || !selectedClientId) return;
    const next = Array.from(new Set([...(project.clientAccessIds ?? []), selectedClientId]));
    await updateProjectDetails(project.id, { clientAccessIds: next });
    setOpen(false);
    setSelectedClientId("");
  };

  const projectClients = project?.clientAccess ?? [];

  return (
    <Card className="bg-card/80 reveal-up reveal-delay-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Project Clients
          </CardTitle>
          <CardDescription>Client accounts attached to this project.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add client to project</DialogTitle>
              <DialogDescription>
                Attach an existing client account to this project.
              </DialogDescription>
            </DialogHeader>
            {available.length > 0 ? (
              <div className="space-y-4">
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((acct) => (
                      <SelectItem key={acct.id} value={acct.id}>
                        {acct.name} — {acct.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={!selectedClientId}>
                    Add client
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">All clients are already attached to this project.</p>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {(!projectClients || projectClients.length === 0) ? (
          <p className="text-sm text-muted-foreground">No clients attached yet. Add an existing client account.</p>
        ) : (
          projectClients.map((client) => {
            const acct = clientAccounts.find((a) => a.email.toLowerCase() === client.email.toLowerCase());
            const acctId = acct?.id;
            const key = acctId ?? client.email;
            return (
              <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/25 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {client.name.split(" ").map((n) => n[0]).join("").slice(0,2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-400" onClick={async () => {
                  if (!project) return;
                  if (!acctId) return;
                  const next = (project.clientAccessIds ?? []).filter((id) => id !== acctId);
                  await updateProjectDetails(project.id, { clientAccessIds: next });
                }} aria-label={`Remove ${client.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default ProjectClients;
