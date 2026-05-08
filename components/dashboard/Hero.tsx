"use client";

import { useAppContext } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function Hero() {
  const { project, role } = useAppContext();
  const projectSummary = project?.summary;
  const timelineItems = project?.timelineItems ?? [];
  const completedCount = timelineItems.filter((item) => item.status === "Completed").length;
  const progress = timelineItems.length
    ? Math.round((completedCount / timelineItems.length) * 100)
    : 0;
  const nextMilestone =
    timelineItems.find((item) => item.status !== "Completed")?.title ??
    timelineItems[0]?.title ??
    "Kickoff";

  if (!projectSummary) {
    return null;
  }

  return (
    <Card className="border-border bg-card/80 reveal-up">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {projectSummary.companyLogo && (
              <img 
                src={projectSummary.companyLogo} 
                alt={`${projectSummary.client} logo`}
                className="h-12 w-12 rounded-xl border border-border object-cover"
              />
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Project</p>
              <h2 className="text-2xl font-semibold text-foreground">
                {projectSummary.name}
              </h2>
              {role === "admin" && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {projectSummary.client} - {projectSummary.location}
                </p>
              )}
            </div>
          </div>
          {role === "admin" && <Badge variant="primary">{projectSummary.status}</Badge>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-secondary/50 shadow-inner">
            <div
              className="relative h-full rounded-full bg-linear-to-r from-primary/80 to-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {role !== "admin" && (
          <div className="text-xs text-muted-foreground">
            Start date: <span className="text-sm font-semibold text-foreground">{projectSummary.startDate}</span>
          </div>
        )}

        {role === "admin" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Start date</p>
              <p className="text-sm font-semibold">{projectSummary.startDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next milestone</p>
              <p className="text-sm font-semibold">{nextMilestone}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
