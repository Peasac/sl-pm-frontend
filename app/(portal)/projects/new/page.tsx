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
  const [clientMode, setClientMode] = React.useState<"existing" | "new">("existing");
  const [selectedClientEmail, setSelectedClientEmail] = React.useState(
    clientAccounts[0]?.email ?? ""
  );
  const [clientName, setClientName] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [clientPassword, setClientPassword] = React.useState("");
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

  React.useEffect(() => {
    if (clientMode === "existing" && !selectedClientEmail && clientAccounts[0]) {
      setSelectedClientEmail(clientAccounts[0].email);
    }
  }, [clientAccounts, clientMode, selectedClientEmail]);

  React.useEffect(() => {
    if (clientMode === "existing") {
      const selectedClient = clientAccounts.find((account) => account.email === selectedClientEmail);
      if (selectedClient) {
        setClientName(selectedClient.name);
        setClientEmail(selectedClient.email);
        setClientPassword(selectedClient.password);
      }
    }
  }, [clientAccounts, clientMode, selectedClientEmail]);

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
    const clientTitle = clientName.trim();
    const emailValue = clientEmail.trim().toLowerCase();
    const passwordValue = clientPassword.trim();

    if (!projectTitle || !startDate) {
      setFormError("Project name and start date are required.");
      setIsSubmitting(false);
      return;
    }

    if (clientMode === "new" && (!clientTitle || !emailValue || !passwordValue)) {
      setFormError("Client name, email, and password are required for a new account.");
      setIsSubmitting(false);
      return;
    }

    if (clientMode === "new") {
      const exists = clientAccounts.some(
        (account) => account.email.toLowerCase() === emailValue.toLowerCase()
      );
      const memberExists = starlinkMembers.some(
        (member) => member.email.toLowerCase() === emailValue.toLowerCase()
      );
      if (exists) {
        setFormError("That client email already exists. Choose another email.");
        setIsSubmitting(false);
        return;
      }
      if (memberExists) {
        setFormError("That email is already used by a member.");
        setIsSubmitting(false);
        return;
      }
    }

    if (clientMode === "existing" && !selectedClientEmail) {
      setFormError("Select an existing client account.");
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
      client:
        clientMode === "existing"
          ? {
              mode: "existing",
              email: selectedClientEmail,
            }
          : {
              mode: "new",
              name: clientTitle,
              email: emailValue,
              password: passwordValue,
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
                <div className="space-y-2 md:col-span-2">
                  <Label>Client account</Label>
                  <Select value={clientMode} onValueChange={(value) => setClientMode(value as "existing" | "new") }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose client source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="existing">Use existing client account</SelectItem>
                      <SelectItem value="new">Create new client account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {clientMode === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor="existing-client">Select existing client</Label>
                  <Select value={selectedClientEmail} onValueChange={setSelectedClientEmail}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client account" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientAccounts.map((account) => (
                        <SelectItem key={account.email} value={account.email}>
                          {account.name} - {account.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="client-name">Client name</Label>
                    <Input
                      id="client-name"
                      value={clientName}
                      onChange={(event) => setClientName(event.target.value)}
                      placeholder="Client contact or company"
                      required
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password">Client password</Label>
                    <Input
                      id="client-password"
                      type="password"
                      value={clientPassword}
                      onChange={(event) => setClientPassword(event.target.value)}
                      placeholder="Set a temporary portal password"
                      required
                    />
                  </div>
                </div>
              )}

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
                      key={`${index}-${item.title}`}
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
                  Client: {clientMode === "existing" ? (clientAccounts.find((account) => account.email === selectedClientEmail)?.name ?? "Not selected") : (clientName || "Not set")}
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
                    <div key={`${item.title}-${index}`} className="rounded-lg border border-border p-3">
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
