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
            <div className="relative mt-6 mx-auto max-w-3xl">
              {/* Vertical glowing line */}
              <div
                className="absolute top-0 bottom-0 w-[2px] timeline-line start-7 md:start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
                aria-hidden
              />

              <ol className="space-y-10 md:space-y-14">
                {timelineItems.map((item: TimelineItem, i: number) => {
                  const leftSide = i % 2 === 0;
                  return (
                    <li key={item.id} className="relative">
                      {/* Glowing node */}
                      <div
                        className="absolute top-3 h-4 w-4 rounded-full timeline-node start-7 md:start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
                        aria-hidden
                      />

                      {/* Mobile: stacked right of line */}
                      <div className="md:hidden ms-16">
                        <StepCard index={i} label={item.title} align={leftSide ? "left" : "right"} />
                      </div>

                      {/* Desktop: alternating sides */}
                      <div className="hidden md:grid grid-cols-2 gap-12">
                        {leftSide ? (
                          <>
                            <div className="flex justify-end pe-12">
                              <StepCard index={i} label={item.title} align="right" />
                            </div>
                            <div />
                          </>
                        ) : (
                          <>
                            <div />
                            <div className="ps-12">
                              <StepCard index={i} label={item.title} align="left" />
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
    </div>
  );
}

function StepCard({
  index,
  label,
  align = "left",
}: {
  index: number;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`p-4 max-w-sm ${align === "right" ? "text-end" : "text-start"}`}>
      <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse" : "flex-row"}`}>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/40 text-accent shadow-[0_0_18px_-4px_rgba(34,211,238,0.35)]">
          <span className="text-sm font-bold">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Step {String(index + 1).padStart(2, "0")}
          </div>
          <div className="mt-0.5 font-display text-lg font-bold text-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
