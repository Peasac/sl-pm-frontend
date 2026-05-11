"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { CommentPanel } from "@/components/tasks/CommentPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppContext } from "@/components/providers/AppProvider";
import type { TaskStatus } from "@/lib/types";

const statusOptions: TaskStatus[] = ["In Progress", "Completed", "Pending", "Blocked"];

const statusVariantMap: Record<TaskStatus, "success" | "warning" | "outline" | "default"> = {
  "In Progress": "default",
  Completed: "success",
  Pending: "warning",
  Blocked: "outline",
};

function PipelineIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`h-2 w-8 rounded-full ${
              index <= currentStep ? "bg-primary" : "bg-secondary"
            }`}
          />
          <span className="hidden text-xs text-muted-foreground xl:inline">
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TaskTable() {
  const { tasks, deleteTask, addTask, updateTaskStatus, updateTimelineStatus, canEdit, canMarkDone, role, memberName, project } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const [finishOpen, setFinishOpen] = React.useState(false);
  const timelineItems = project?.timelineItems ?? [];
  const searchParams = useSearchParams();
  const stageParam = searchParams.get("stage") ?? "";
  const [form, setForm] = React.useState({
    name: "",
    category: "",
    assignee: "",
    status: "In Progress" as TaskStatus,
  });

  const assigneeOptions = React.useMemo(() =>
    (project?.contacts ?? []).filter((contact) => contact.team === "Starlink Team"),
    [project?.contacts]
  );

  const selectedStage = timelineItems.find((item) => item.id === stageParam) ?? null;

  // Get tasks for the selected stage
  const allStageTasks = selectedStage
    ? tasks.filter((task) => task.timelineStageId === selectedStage.id)
    : [];

  // For member role, filter to only their assigned tasks
  const stageTasks =
    role === "member" && memberName
      ? allStageTasks.filter((task) => task.assignee === memberName)
      : allStageTasks;

  const allStageTasksComplete =
    allStageTasks.length > 0 && allStageTasks.every((task) => task.status === "Completed");
  const isStageComplete = selectedStage?.status === "Completed";
  const [isSubmittingTask, setIsSubmittingTask] = React.useState(false);

  const handleAddTask = async () => {
    if (!form.name.trim() || !form.category.trim() || !form.assignee.trim()) {
      return;
    }

    if (!selectedStage) {
      return;
    }

    const currentStep = form.status === "Completed" ? 2 : form.status === "In Progress" ? 1 : 0;

    setIsSubmittingTask(true);
    await addTask({
      name: form.name.trim(),
      category: form.category.trim(),
      assignee: form.assignee.trim(),
      timelineStageId: selectedStage.id,
      status: form.status,
      pipeline: { steps: ["Plan", "Build", "Launch"], currentStep },
    });

    setForm({ name: "", category: "", assignee: "", status: "In Progress" });
    setIsSubmittingTask(false);
    setOpen(false);
  };

  const handleFinishStage = () => {
    if (!selectedStage || isStageComplete) {
      return;
    }
    if (allStageTasksComplete) {
      updateTimelineStatus(selectedStage.id, "Completed");
      return;
    }
    setFinishOpen(true);
  };

  const handleReopenStage = () => {
    if (!selectedStage) {
      return;
    }
    updateTimelineStatus(selectedStage.id, "In Progress");
  };

  const handleConfirmFinish = () => {
    if (!selectedStage) {
      return;
    }
    updateTimelineStatus(selectedStage.id, "Completed");
    setFinishOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm("Delete this task? This will also remove its photos.");
    if (!confirmed) {
      return;
    }

    await deleteTask(taskId);
  };

  // For member role, only show timeline stages that have tasks assigned to them
  const visibleTimelineItems =
    role === "member" && memberName
      ? timelineItems.filter((item) =>
          tasks.some(
            (task) => task.timelineStageId === item.id && task.assignee === memberName
          )
        )
      : timelineItems;

  return (
    <div className="space-y-4">
      {!selectedStage ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Timeline stages</h2>
            <p className="text-sm text-muted-foreground">
              {role === "member"
                ? "Select a stage to view your assigned tasks."
                : "Select a stage to open its tasks."}
            </p>
          </div>
          {visibleTimelineItems.length === 0 && role === "member" ? (
            <div className="rounded-xl border border-border bg-card/80 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tasks are currently assigned to you in any stage.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleTimelineItems.map((item) => (
                (() => {
                  const stageTaskCount = tasks.filter(
                    (task) => task.timelineStageId === item.id
                  ).length;

                  return (
                <Link
                  key={item.id}
                  href={`/tasks?stage=${item.id}`}
                  className="rounded-xl border border-border bg-card/80 p-4 transition hover:bg-secondary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
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
                  <p className="mt-2 text-xs text-muted-foreground">{item.date}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {stageTaskCount} task{stageTaskCount === 1 ? "" : "s"}
                  </p>
                </Link>
                  );
                })()
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Task pipeline</h2>
              <p className="text-sm text-muted-foreground">
                Viewing {role === "member" ? "your " : ""}tasks in {selectedStage.title}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canEdit && (
                <Button variant="outline" onClick={handleFinishStage} disabled={isStageComplete}>
                  {isStageComplete ? "Stage completed" : "Finish timeline stage"}
                </Button>
              )}
              {canEdit && isStageComplete && (
                <Button variant="secondary" onClick={handleReopenStage}>
                  Reopen stage
                </Button>
              )}
              {canEdit && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>Add task</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create new task</DialogTitle>
                      <DialogDescription>Assign a new task to the execution team.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                        Timeline stage: {selectedStage.title}
                      </div>
                      <Input
                        placeholder="Task name"
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                      />
                      <Input
                        placeholder="Category"
                        value={form.category}
                        onChange={(event) => setForm({ ...form, category: event.target.value })}
                      />
                      <Select
                        value={form.assignee}
                        onValueChange={(value) => setForm({ ...form, assignee: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {assigneeOptions.map((member) => (
                            <SelectItem key={member.email} value={member.name}>
                              {member.name} - {member.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={form.status}
                        onValueChange={(value) => setForm({ ...form, status: value as TaskStatus })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTask} disabled={isSubmittingTask}>
                        {isSubmittingTask ? "Adding task..." : "Add task"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tasks still open</DialogTitle>
                <DialogDescription>
                  Some tasks in this timeline stage are not completed yet. You can finish the stage
                  anyway, or cancel and complete the tasks first.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setFinishOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmFinish}>Mark stage complete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="rounded-xl border border-border bg-card/80 reveal-up">
            {stageTasks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {role === "member"
                    ? "No tasks assigned to you in this stage."
                    : "No tasks in this stage yet."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Pipeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Comments</TableHead>
                    {canEdit && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stageTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium text-foreground">{task.name}</TableCell>
                      <TableCell className="text-muted-foreground">{task.category}</TableCell>
                      <TableCell className="text-muted-foreground">{task.assignee}</TableCell>
                      <TableCell>
                        <PipelineIndicator steps={task.pipeline.steps} currentStep={task.pipeline.currentStep} />
                      </TableCell>
                      <TableCell>
                        {canMarkDone ? (
                          <Select
                            value={task.status}
                            onValueChange={(value) => updateTaskStatus(task.id, value as TaskStatus)}
                          >
                            <SelectTrigger className="h-8 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={statusVariantMap[task.status]}>{task.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{task.updatedAt}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/photos?task=${task.id}${selectedStage ? `&stage=${selectedStage.id}` : ""}`}
                          >
                            View
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Comments ({task.comments.length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Comments</DialogTitle>
                              <DialogDescription>{task.name}</DialogDescription>
                            </DialogHeader>
                            <CommentPanel task={task} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}


    </div>
  );
}
