"use client";

import * as React from "react";
import { Plus, Trash2, Users } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectMembers() {
  const {
    role,
    contacts,
    starlinkMembers,
    addProjectMember,
    removeProjectMember,
  } = useAppContext();

  const [open, setOpen] = React.useState(false);
  const [selectedMemberId, setSelectedMemberId] = React.useState("");

  if (role !== "admin") {
    return null;
  }

  const projectStarlinkMembers = contacts.filter(
    (contact) => contact.team === "Starlink Team"
  );

  const availableMembers = starlinkMembers.filter(
    (member) =>
      !projectStarlinkMembers.some(
        (pm) => pm.email === member.email
      )
  );

  const handleAdd = () => {
    if (!selectedMemberId) {
      return;
    }
    addProjectMember(selectedMemberId);
    setSelectedMemberId("");
    setOpen(false);
  };

  return (
    <Card className="bg-card/80 reveal-up reveal-delay-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Project Members
          </CardTitle>
          <CardDescription>
            Starlink team members assigned to this project.
          </CardDescription>
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
              <DialogTitle>Add member to project</DialogTitle>
              <DialogDescription>
                Select a Starlink team member to assign to this project.
              </DialogDescription>
            </DialogHeader>
            {availableMembers.length > 0 ? (
              <div className="space-y-4">
                <Select
                  value={selectedMemberId}
                  onValueChange={setSelectedMemberId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} — {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={!selectedMemberId}>
                    Add member
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  All Starlink members are already assigned to this project.
                </p>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {projectStarlinkMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Starlink members assigned yet. Add members from the company
            directory.
          </p>
        ) : (
          projectStarlinkMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/25 p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {member.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.role} · {member.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-400"
                onClick={() => removeProjectMember(member.id)}
                aria-label={`Remove ${member.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
