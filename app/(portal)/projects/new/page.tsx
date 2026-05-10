"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { useAppContext } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ClientAccount, Contact, CreateProjectInput, TimelineStatus } from "@/lib/types";

type DraftTimelineItem = CreateProjectInput["timelineItems"][number];

const timelineStatusOptions: Array<{ label: string; value: TimelineStatus }> = [
  { label: "Completed", value: "Completed" },
  { label: "In Progress", value: "In Progress" },
  { label: "Pending", value: "Pending" },
  { label: "Blocked", value: "Blocked" },
];

const initialTimelineItems: DraftTimelineItem[] = [
  {
    title: "Project kickoff",
    date: "",
    description: "Scope lock, stakeholder alignment, and kickoff call.",
    status: "Pending",
  },
  {
    title: "Site survey and design",
    date: "",
    description: "Survey, access planning, and engineering review.",
    status: "Pending",
  },
  {
    title: "Build and commissioning",
    date: "",
    description: "Field install, validation, and handoff preparation.",
    status: "Pending",
  },
];

const emptyTimelineItem = (): DraftTimelineItem => ({
  title: "",
  date: "",
  description: "",
  status: "Pending",
});

const getMemberInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "SL";

export default function NewProjectPage() {
  const router = useRouter();
  const { addProject, canEdit, clientAccounts, starlinkMembers } = useAppContext();
  const [projectName, setProjectName] = React.useState("");
  const [companyLogo, setCompanyLogo] = React.useState("");
  const [companyLogoFile, setCompanyLogoFile] = React.useState<File | null>(null);
  const [startDate, setStartDate] = React.useState("");
  const [selectedClientEmails, setSelectedClientEmails] = React.useState<string[]>([]);
  const [newClients, setNewClients] = React.useState<Array<{ name: string; email: string; password: string }>>([]);
  const [newClientForm, setNewClientForm] = React.useState({ name: "", email: "", password: "" });
  const [selectedMemberEmails, setSelectedMemberEmails] = React.useState<string[]>([
    starlinkMembers[0]?.email ?? "",
    starlinkMembers[1]?.email ?? "",
  ]);
  const [timelineItems, setTimelineItems] = React.useState<DraftTimelineItem[]>(initialTimelineItems);
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectableMembers = starlinkMembers.filter(
    (member) => member.role.toLowerCase() !== "admin"
  );

  const selectedMembers = selectableMembers.filter((member) =>
    selectedMemberEmails.includes(member.email)
  );

  React.useEffect(() => {
    if (!selectedMemberEmails.length && starlinkMembers.length) {
      setSelectedMemberEmails(starlinkMembers.slice(0, 2).map((member) => member.email));
    }
  }, [selectedMemberEmails.length, starlinkMembers]);

  const toggleClient = (email: string) => {
    setSelectedClientEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const addNewClient = () => {
    if (!newClientForm.name || !newClientForm.email || !newClientForm.password) return;
    setNewClients(prev => [...prev, { ...newClientForm }]);
    setNewClientForm({ name: "", email: "", password: "" });
  };

  const removeNewClient = (index: number) => {
    setNewClients(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimelineItem = (
    index: number,
    field: keyof DraftTimelineItem,
    value: string
  ) => {
    setTimelineItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addTimelineItem = () => {
    setTimelineItems((previousItems) => [...previousItems, emptyTimelineItem()]);
  };

  const removeTimelineItem = (index: number) => {
    setTimelineItems((previousItems) =>
      previousItems.length === 1
        ? previousItems
        : previousItems.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const toggleMember = (email: string) => {
    setSelectedMemberEmails((previousEmails) =>
      previousEmails.includes(email)
        ? previousEmails.filter((value) => value !== email)
        : [...previousEmails, email]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) {
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    const projectTitle = projectName.trim();

    if (!projectTitle || !startDate) {
      setFormError("Project name and start date are required.");
      setIsSubmitting(false);
      return;
    }

    if (selectedClientEmails.length === 0 && newClients.length === 0) {
      setFormError("Select or add at least one client.");
      setIsSubmitting(false);
      return;
    }

    const timeline = timelineItems.filter(
      (item) => item.title.trim() || item.date.trim() || item.description.trim()
    );

    if (!timeline.length) {
      setFormError("Add at least one timeline milestone.");
      setIsSubmitting(false);
      return;
    }

    let uploadedLogoUrl = companyLogo.trim();

    if (companyLogoFile) {
      try {
        const token = window.localStorage.getItem("slpm:token");
        const formData = new FormData();
        formData.append("file", companyLogoFile);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/company-logo`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
          setFormError(payload.message || "Failed to upload company logo.");
          setIsSubmitting(false);
          return;
        }
        uploadedLogoUrl = payload.data.url;
      } catch (error) {
        setFormError("Failed to upload company logo.");
        setIsSubmitting(false);
        return;
      }
    }

    await addProject({
      name: projectTitle,
      startDate,
      companyLogo: uploadedLogoUrl || undefined,
      client: {
        existingEmails: selectedClientEmails,
        newClients: newClients,
      },
      members: selectedMembers,
      timelineItems: timeline,
    });

    router.push("/overview");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 reveal-up">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin tools</p>
          <h1 className="text-3xl font-semibold">Add Project</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create a new project, attach client access, assign Starlink members, and sketch the
            delivery timeline before handing it off to the portal.
          </p>
        </div>
        <Badge variant="primary">Admin only</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-card/80 reveal-up reveal-delay-1">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Project Setup</CardTitle>
              <CardDescription>
                Fill out the client details and draft the first milestone sequence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="project-name">Project name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="Starlink Expansion - New Phase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-logo">Company logo</Label>
                  <Input
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setCompanyLogoFile(file);
                      setCompanyLogo(file ? file.name : "");
                    }}
                  />
                  {companyLogo && (
                    <p className="text-xs text-muted-foreground">Selected: {companyLogo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Client access</Label>
                    <p className="text-xs text-muted-foreground">Select existing or add new</p>
                  </div>
                  
                  {/* Existing Clients Checkboxes */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {clientAccounts.length > 0 ? (
                      clientAccounts.map((account) => {
                        const checked = selectedClientEmails.includes(account.email);
                        return (
                          <label
                            key={account.email}
                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition hover:bg-secondary/50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleClient(account.email)}
                              className="mt-1 h-4 w-4 rounded border-border bg-background text-primary"
                            />
                            <div className="flex-1 space-y-0.5">
                              <p className="text-sm font-semibold">{account.name}</p>
                              <p className="text-xs text-muted-foreground">{account.email}</p>
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <div className="col-span-2 rounded-xl border border-dashed border-border p-4 text-center">
                        <p className="text-xs text-muted-foreground">No existing client accounts found.</p>
                      </div>
                    )}
                  </div>

                  {/* New Clients List */}
                  {newClients.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase">Newly added to this project</Label>
                      <div className="grid gap-2">
                        {newClients.map((client, index) => (
                          <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-3 py-2">
                            <div className="text-xs">
                              <span className="font-medium">{client.name}</span>
                              <span className="ml-2 text-muted-foreground">({client.email})</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => removeNewClient(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Client Form */}
                  <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-3">
                    <p className="text-xs font-semibold">Create new client account</p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <Input
                        placeholder="Client name"
                        value={newClientForm.name}
                        onChange={e => setNewClientForm(prev => ({ ...prev, name: e.target.value }))}
                        className="h-9 text-xs"
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newClientForm.email}
                        onChange={e => setNewClientForm(prev => ({ ...prev, email: e.target.value }))}
                        className="h-9 text-xs"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Password"
                          type="password"
                          value={newClientForm.password}
                          onChange={e => setNewClientForm(prev => ({ ...prev, password: e.target.value }))}
                          className="h-9 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addNewClient}
                          size="sm"
                          disabled={!newClientForm.name || !newClientForm.email || !newClientForm.password}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Starlink members</p>
                  <p className="text-xs text-muted-foreground">
                    Assign the Starlink side that will be attached to this project.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectableMembers.map((member) => {
                    const checked = selectedMemberEmails.includes(member.email);

                    return (
                      <label
                        key={member.email}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition hover:bg-secondary/50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMember(member.email)}
                          className="mt-1 h-4 w-4 rounded border-border bg-background text-primary"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">{member.name}</p>
                            <Badge variant="outline">{getMemberInitials(member.name)}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Timeline design</p>
                    <p className="text-xs text-muted-foreground">
                      Draft the timeline milestones for this project.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addTimelineItem}>
                    <Plus className="h-4 w-4" />
                    Add milestone
                  </Button>
                </div>

                <div className="space-y-4">
                  {timelineItems.map((item, index) => (
                    <div
                      key={`timeline-milestone-${index}`}
                      className="rounded-xl border border-border bg-secondary/25 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Milestone {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimelineItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`timeline-title-${index}`}>Title</Label>
                          <Input
                            id={`timeline-title-${index}`}
                            value={item.title}
                            onChange={(event) =>
                              updateTimelineItem(index, "title", event.target.value)
                            }
                            placeholder="Kickoff, survey, design review..."
                          />
                        </div>
                        {index === 0 && (
                          <div className="space-y-2">
                            <Label htmlFor={`timeline-date-${index}`}>Date</Label>
                            <Input
                              id={`timeline-date-${index}`}
                              type="date"
                              value={item.date}
                              onChange={(event) =>
                                updateTimelineItem(index, "date", event.target.value)
                              }
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={item.status}
                            onValueChange={(value) =>
                              updateTimelineItem(index, "status", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {timelineStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`timeline-description-${index}`}>Description</Label>
                          <Textarea
                            id={`timeline-description-${index}`}
                            value={item.description}
                            onChange={(event) =>
                              updateTimelineItem(index, "description", event.target.value)
                            }
                            placeholder="Describe what happens at this stage."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {formError && (
                  <p className="text-sm text-red-400">{formError}</p>
                )}
                <Button type="submit" disabled={!canEdit || isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create project"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/overview">Cancel</Link>
                </Button>
              </div>
              </div>
            </CardContent>
          </form>
        </Card>

        <div className="space-y-6 reveal-up reveal-delay-2">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle>Live preview</CardTitle>
              <CardDescription>
                This is how the portal will receive the project structure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Project</p>
                <p className="mt-1 text-lg font-semibold">
                  {projectName || "Untitled project"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clients: {selectedClientEmails.length + newClients.length === 0 ? "Not selected" : `${selectedClientEmails.length + newClients.length} assigned`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Start date: {startDate || "Not set"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Selected Starlink members</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedMembers.length ? (
                    selectedMembers.map((member) => (
                      <Badge key={member.email} variant="outline">
                        {member.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No members selected.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Timeline preview</p>
                <div className="mt-3 space-y-3">
                  {timelineItems.map((item, index) => (
                    <div key={`preview-milestone-${index}`} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {item.title || `Milestone ${index + 1}`}
                        </p>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.date || "No date set"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.description || "No description yet."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
