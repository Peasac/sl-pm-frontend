"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
import type { TimelineItem, TimelineStatus } from "@/lib/types";

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { projects, updateProjectDetails, canEdit } = useAppContext();
  
  const project = projects.find(p => p.id === id);
  
  const [name, setName] = React.useState("");
  const [timelineItems, setTimelineItems] = React.useState<TimelineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setTimelineItems(project.timelineItems);
    }
  }, [project]);

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">Only admins can edit projects.</p>
        <Button asChild className="mt-4">
          <Link href="/overview">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold">Project Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/overview">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const addMilestone = () => {
    const newItem: TimelineItem = {
      id: `new-${Date.now()}`,
      title: "",
      date: "",
      description: "",
      status: "Pending",
    };
    setTimelineItems([...timelineItems, newItem]);
  };

  const removeMilestone = (index: number) => {
    setTimelineItems(timelineItems.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof TimelineItem, value: string) => {
    setTimelineItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateProjectDetails(project.id, {
        name,
        timelineItems: timelineItems.map(({ id, ...rest }) => rest), // Strip temp IDs
      });
      router.push("/overview");
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 reveal-up">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/overview">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">Edit Project</h1>
          <p className="text-muted-foreground">Update project details and manage the roadmap milestones.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Milestones & Timeline</CardTitle>
              <CardDescription>Add or remove milestones to the project roadmap.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              {timelineItems.map((item, index) => (
                <div key={item.id} className="relative grid gap-4 p-4 rounded-xl border border-border bg-secondary/10 group">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMilestone(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Milestone {index + 1}</Label>
                      <Input 
                        placeholder="Milestone title" 
                        value={item.title} 
                        onChange={e => updateMilestone(index, "title", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={item.status} 
                        onValueChange={val => updateMilestone(index, "status", val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input 
                        type="date" 
                        value={item.date} 
                        onChange={e => updateMilestone(index, "date", e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea 
                        placeholder="What needs to happen in this stage?"
                        value={item.description}
                        onChange={e => updateMilestone(index, "description", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/overview">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
