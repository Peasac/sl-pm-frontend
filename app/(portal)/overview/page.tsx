"use client";

import Link from "next/link";

import { Hero } from "@/components/dashboard/Hero";
import { ProjectMembers } from "@/components/dashboard/ProjectMembers";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { useAppContext } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineItem } from "@/lib/types";

const quickLinks = [
  {
    title: "Task pipeline",
    description: "Track assignments, status, and comments.",
    href: "/tasks",
  },
  {
    title: "Photo documentation",
    description: "Before/after progress by site.",
    href: "/photos",
  },
];

export default function OverviewPage() {
  const { canEdit, role, user, project } = useAppContext();
  const portalLabel =
    role === "admin"
      ? "Admin Portal"
      : role === "member"
        ? "Member Portal"
        : "Client Portal";
  const timelineItems = project?.timelineItems ?? [];

  return (
    <div className="space-y-6">


      <div className="flex flex-wrap items-start justify-between gap-4 reveal-up">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back{user ? `, ${user.name}` : ""}</h2>
          {/* <p className="mt-2 text-sm text-muted-foreground">
            You are viewing the {portalLabel}.{" "}
            {role === "member"
              ? "You can view project progress and upload photos for your assigned tasks."
              : `Editing is ${canEdit ? "enabled" : "disabled"}.`}
          </p> */}
        </div>
      </div>
      <Hero />
      <StatsCards />
      <ProjectMembers />

      <div className="grid gap-4 md:grid-cols-2 reveal-up reveal-delay-1">
        {quickLinks.map((link) => (
          <Card key={link.href} className="bg-card/80">
            <CardHeader>
              <CardTitle className="text-base">{link.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{link.description}</p>
              <Button asChild variant="outline">
                <Link href={link.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>



      <div className="grid gap-4">
        <Card className="bg-card/80 reveal-up reveal-delay-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Timeline</CardTitle>
              <p className="text-xs text-muted-foreground">Key milestones across the program</p>
            </div>
            <Badge variant="outline">Vertical</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timelineItems.map((item: TimelineItem, index: number) => (
                <div key={item.id} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    {index < timelineItems.length - 1 && (
                      <div className="mt-2 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <Badge
                        variant={
                          item.status === "Completed"
                            ? "success"
                            : item.status === "In Progress"
                              ? "default"
                              : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
