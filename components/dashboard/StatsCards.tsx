"use client";

import { useAppContext } from "@/components/providers/AppProvider";
import { Card, CardContent } from "@/components/ui/card";

export function StatsCards() {
  const { project, role } = useAppContext();
  const timelineItems = project?.timelineItems ?? [];
  const completedCount = timelineItems.filter((item) => item.status === "Completed").length;
  const inProgressCount = timelineItems.filter((item) => item.status === "In Progress").length;
  const pendingCount = timelineItems.filter((item) => item.status === "Pending").length;
  const overviewStats = [
    { label: "Completed", value: completedCount, detail: "Milestones" },
    { label: "In Progress", value: inProgressCount, detail: "Active streams" },
    { label: "Pending", value: pendingCount, detail: "Approvals" },
  ];

  if (role !== "admin") {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 reveal-up reveal-delay-1">
      {overviewStats.map((stat) => (
        <Card key={stat.label} className="bg-card/80">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.detail}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
