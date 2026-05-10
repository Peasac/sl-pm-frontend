"use client";

import * as React from "react";
import Link from "next/link";

import { Hero } from "@/components/dashboard/Hero";
import { ProjectMembers } from "@/components/dashboard/ProjectMembers";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { useAppContext } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProjectClients from "@/components/dashboard/ProjectClients";
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
  const timelineItems = project?.timelineItems ?? [];
  const { projects } = useAppContext();

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 reveal-up">
        <h2 className="text-2xl font-semibold">Welcome to the Portal</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have any active projects yet. Get started by creating your first project.
        </p>
        {role === "admin" && (
          <Button asChild>
            <Link href="/projects/new">Create Project</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">


      <div className="flex flex-wrap items-start justify-between gap-4 reveal-up">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back{user ? `, ${user.name}` : ""}</h2>
        </div>
      </div>
      <Hero />
      <StatsCards />
      <ProjectMembers />
      <ProjectClients />

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
            <div className="flex items-center gap-2">
              <Badge variant="outline">Vertical</Badge>
              {canEdit && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${project?.id}/edit`}>Edit timeline</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mt-6 mx-auto max-w-3xl">
              {/* Vertical glowing line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 timeline-line inset-s-7 md:inset-s-1/2 -translate-x-1/2 rtl:translate-x-1/2"
                aria-hidden
              />

              <ol className="space-y-10 md:space-y-14">
                {timelineItems.map((item: TimelineItem, i: number) => {
                  const leftSide = i % 2 === 0;
                  return (
                    <li key={item.id} className="relative">
                      {/* Glowing node */}
                      <div
                        className="absolute top-3 h-4 w-4 rounded-full timeline-node inset-s-7 md:inset-s-1/2 -translate-x-1/2 rtl:translate-x-1/2"
                        aria-hidden
                      />

                      {/* Mobile: stacked right of line */}
                      <div className="md:hidden ms-16">
                        <StepCard index={i} label={item.title} status={item.status} date={item.date} align={leftSide ? "left" : "right"} />
                      </div>

                      {/* Desktop: alternating sides */}
                      <div className="hidden md:grid grid-cols-2 gap-12">
                        {leftSide ? (
                          <>
                            <div className="flex justify-end pe-12">
                              <StepCard index={i} label={item.title} status={item.status} date={item.date} align="right" />
                            </div>
                            <div />
                          </>
                        ) : (
                          <>
                            <div />
                            <div className="ps-12">
                              <StepCard index={i} label={item.title} status={item.status} date={item.date} align="left" />
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* ProjectClients component handles the add-client dialog */}
    </div>
  );
}

function StepCard({
  index,
  label,
  status,
  date,
  align = "left",
}: {
  index: number;
  label: string;
  status: string;
  date?: string;
  align?: "left" | "right";
}) {
  let colorClasses = "bg-accent/15 ring-1 ring-accent/40 text-accent shadow-[0_0_18px_-4px_rgba(34,211,238,0.35)]";
  let textColorClasses = "text-accent";

  if (status === "Completed") {
    colorClasses = "bg-emerald-500/15 ring-1 ring-emerald-500/40 text-emerald-500 shadow-[0_0_18px_-4px_rgba(16,185,129,0.35)]";
    textColorClasses = "text-emerald-500";
  } else if (status === "In Progress") {
    colorClasses = "bg-amber-500/15 ring-1 ring-amber-500/40 text-amber-500 shadow-[0_0_18px_-4px_rgba(245,158,11,0.35)]";
    textColorClasses = "text-amber-500";
  }

  const badgeClasses =
    status === "Completed"
      ? "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700"
      : status === "In Progress"
      ? "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700"
      : "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground";

  return (
    <div className={`p-4 max-w-sm ${align === "right" ? "text-end" : "text-start"}`}>
      <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${colorClasses}`}>
          <span className="text-sm font-bold">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div>
          <div className={`flex items-center gap-3 ${align === "right" ? "justify-end" : "justify-start"}`}>
            <div className={`font-display text-xs font-bold uppercase tracking-[0.2em] ${textColorClasses}`}>
              Step {String(index + 1).padStart(2, "0")}
            </div>
            <div className={badgeClasses} aria-hidden={false}>
              {status}
            </div>
          </div>
          <div className="mt-0.5 font-display text-lg font-bold text-foreground">{label}</div>
          {date && (status === "In Progress" || status === "Completed") && (
            <div className="text-xs text-muted-foreground mt-0.5">{date}</div>
          )}
        </div>
      </div>
    </div>
  );
}
