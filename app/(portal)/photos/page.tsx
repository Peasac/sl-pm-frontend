"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { useAppContext } from "@/components/providers/AppProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskMediaItem, TaskMediaType, TaskMediaVariant } from "@/lib/types";

const mediaVariantOptions: TaskMediaVariant[] = ["before", "after", "other"];

const resolveMediaType = (file: File): TaskMediaType =>
  file.type.startsWith("video/") ? "video" : "image";

function ImageCanvasDialog({ media, onClose }: { media: TaskMediaItem | null, onClose: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [color, setColor] = React.useState("#ef4444");
  
  React.useEffect(() => {
    if (!media || media.type !== "image" || !canvasRef.current || !imageRef.current) return;
    
    // Clear canvas when media changes
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [media]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  if (!media) return null;
  
  return (
    <Dialog open={!!media} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>View and Annotate</DialogTitle>
          <DialogDescription>
            {media.label}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 py-2">
           <div className="flex items-center gap-2">
             <span className="text-sm font-medium">Pen Color:</span>
             <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 cursor-pointer rounded-md border border-border" />
           </div>
           <Button variant="outline" size="sm" onClick={clearCanvas}>Clear Annotations</Button>
        </div>
        
        <div className="relative flex-1 min-h-0 overflow-auto bg-black/5 rounded-xl border border-border flex items-center justify-center p-4">
          <div className="relative inline-block max-w-full">
            <img 
              ref={imageRef} 
              src={media.url} 
              alt="Zoomed" 
              className="max-w-full max-h-[65vh] object-contain block pointer-events-none select-none" 
              onLoad={(e) => {
                 if (canvasRef.current) {
                   canvasRef.current.width = e.currentTarget.naturalWidth;
                   canvasRef.current.height = e.currentTarget.naturalHeight;
                 }
              }}
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PhotosPageContent() {
  const { project, tasks, taskMedia, addTaskMedia, canUpload, role, memberName } = useAppContext();
  const timelineItems = project?.timelineItems ?? [];
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const stageParam = searchParams.get("stage") ?? "";
  const taskParam = searchParams.get("task") ?? "";

  const taskFromParam = tasks.find((task) => task.id === taskParam) ?? null;
  const derivedStageId = taskFromParam?.timelineStageId ?? stageParam;
  const selectedStage = timelineItems.find((item) => item.id === derivedStageId) ?? null;

  // Get tasks for the selected stage
  const allStageTasks = selectedStage
    ? tasks.filter((task) => task.timelineStageId === selectedStage.id)
    : [];

  // For member role, filter to only their assigned tasks
  const stageTasks =
    role === "member" && memberName
      ? allStageTasks.filter((task) => task.assignee === memberName)
      : allStageTasks;

  // For member role, only show timeline stages that have their tasks
  const visibleTimelineItems =
    role === "member" && memberName
      ? timelineItems.filter((item) =>
          tasks.some(
            (task) => task.timelineStageId === item.id && task.assignee === memberName
          )
        )
      : timelineItems;

  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);
  const [zoomedMedia, setZoomedMedia] = React.useState<TaskMediaItem | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [mediaForm, setMediaForm] = React.useState({
    variant: "before" as TaskMediaVariant,
    label: "",
  });
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [uploadLabel, setUploadLabel] = React.useState("");
  const [uploadLabelLocked, setUploadLabelLocked] = React.useState(false);
  const [uploadVariant, setUploadVariant] = React.useState<TaskMediaVariant>("before");
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (taskParam) {
      setActiveTaskId(taskParam);
    } else {
      setActiveTaskId(null);
    }
  }, [taskParam]);

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? taskFromParam ?? null;
  const mediaItems = activeTask
    ? taskMedia.filter((item) => item.taskId === activeTask.id)
    : [];
  const groupedMedia = React.useMemo(() => {
    const groups = new Map<
      string,
      { label: string; before: TaskMediaItem[]; after: TaskMediaItem[]; other: TaskMediaItem[] }
    >();

    mediaItems.forEach((media) => {
      const group = groups.get(media.label) ?? {
        label: media.label,
        before: [],
        after: [],
        other: [],
      };

      group[media.variant].push(media);
      groups.set(media.label, group);
    });

    return Array.from(groups.values());
  }, [mediaItems]);

  const handleOpenTask = (taskId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("task", taskId);
    if (selectedStage) {
      params.set("stage", selectedStage.id);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setActiveTaskId(taskId);
  };

  const handleCloseDialog = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("task");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setActiveTaskId(null);
    setIsUploadDialogOpen(false);
  };

  const openUploadDialog = (label?: string) => {
    setUploadLabel(label ?? "");
    setUploadLabelLocked(Boolean(label));
    setUploadVariant("before");
    setSelectedFiles([]);
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
    setIsUploadDialogOpen(true);
  };

  const handleAddMedia = () => {
    if (!activeTask || selectedFiles.length === 0 || !uploadLabel.trim()) {
      return;
    }

    selectedFiles.forEach((file) => {
      addTaskMedia({
        taskId: activeTask.id,
        type: resolveMediaType(file),
        variant: uploadVariant,
        url: URL.createObjectURL(file),
        label: uploadLabel.trim(),
      });
    });

    setMediaForm({ variant: "before", label: "" });
    setSelectedFiles([]);
    setUploadLabel("");
    setUploadVariant("before");
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
    setIsUploadDialogOpen(false);
  };

  const renderMediaPreview = (media: TaskMediaItem) => {
    if (media.type === "video") {
      return (
        <video
          className="h-40 w-full rounded-lg border border-border object-cover"
          src={media.url}
          controls
        />
      );
    }

    return (
      <img
        src={media.url}
        alt={media.label}
        className="h-40 w-full rounded-lg border border-border object-cover cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setZoomedMedia(media)}
      />
    );
  };

  return (
    <div className="space-y-6">
      {!selectedStage ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Timeline stages</h2>
            <p className="text-sm text-muted-foreground">
              {role === "member"
                ? "Select a stage to view media for your assigned tasks."
                : "Select a stage to view task media."}
            </p>
          </div>
          {visibleTimelineItems.length === 0 && role === "member" ? (
            <div className="rounded-xl border border-border bg-card/80 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tasks are currently assigned to you. Photos will appear here once you have assigned tasks.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleTimelineItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/photos?stage=${item.id}`}
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
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{selectedStage.title}</h2>
              <p className="text-sm text-muted-foreground">
                {role === "member"
                  ? "Media for your assigned tasks in this stage."
                  : "Task media grouped by stage."}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/photos">Back to stages</Link>
            </Button>
          </div>
          {stageTasks.length === 0 && role === "member" ? (
            <div className="rounded-xl border border-border bg-card/80 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No tasks assigned to you in this stage.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stageTasks.map((task) => {
                const taskItems = taskMedia.filter((item) => item.taskId === task.id);
                const mediaCount = taskItems.length;
                const previewItems = taskItems
                  .slice()
                  .sort((a, b) => {
                    const order: Record<TaskMediaVariant, number> = {
                      before: 0,
                      after: 1,
                      other: 2,
                    };
                    return order[a.variant] - order[b.variant];
                  })
                  .slice(0, 3);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleOpenTask(task.id)}
                    className="rounded-xl border border-border bg-card/80 p-4 text-left transition hover:bg-secondary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{task.name}</p>
                      <Badge variant={task.status === "Completed" ? "success" : "default"}>
                        {task.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Assignee: {task.assignee}</p>
                    {previewItems.length > 0 ? (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {previewItems.map((media) => (
                          <div
                            key={media.id}
                            className="overflow-hidden rounded-lg border border-border"
                          >
                            {media.type === "video" ? (
                              <video
                                className="h-16 w-full object-cover"
                                src={media.url}
                                muted
                                playsInline
                              />
                            ) : (
                              <img
                                src={media.url}
                                alt={media.label}
                                className="h-16 w-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted-foreground">No media yet</p>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                      {mediaCount} media item{mediaCount === 1 ? "" : "s"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={Boolean(activeTaskId)} onOpenChange={(open) => (!open ? handleCloseDialog() : undefined)}>
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle>{activeTask ? `Media for ${activeTask.name}` : "Task media"}</DialogTitle>
            <DialogDescription>
              {activeTask
                ? "Before/after documentation and media updates for this task."
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {mediaItems.length === 0 && (
              <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
            )}
            {mediaItems.length > 0 && (
              <div className="space-y-6">
                {groupedMedia.map((group) => (
                  <div key={group.label} className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{group.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.before.length + group.after.length + group.other.length} attachment
                          {group.before.length + group.after.length + group.other.length === 1
                            ? ""
                            : "s"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Grouped</Badge>
                        {canUpload && activeTask && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openUploadDialog(group.label)}
                            aria-label={`Add attachments to ${group.label}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-3 rounded-xl border border-border bg-card/80 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">Before</p>
                          <Badge variant="outline">{group.before.length}</Badge>
                        </div>
                        {group.before.length > 0 ? (
                          <div className="space-y-3">
                            {group.before.map((media) => (
                              <div key={media.id} className="space-y-2">
                                {renderMediaPreview(media)}
                                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                                  <Badge variant="outline">{media.type}</Badge>
                                  <span>{media.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No before media yet.</p>
                        )}
                      </div>

                      <div className="space-y-3 rounded-xl border border-border bg-card/80 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">After</p>
                          <Badge variant="outline">{group.after.length}</Badge>
                        </div>
                        {group.after.length > 0 ? (
                          <div className="space-y-3">
                            {group.after.map((media) => (
                              <div key={media.id} className="space-y-2">
                                {renderMediaPreview(media)}
                                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                                  <Badge variant="outline">{media.type}</Badge>
                                  <span>{media.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No after media yet.</p>
                        )}
                      </div>
                    </div>

                    {group.other.length > 0 && (
                      <div className="space-y-3 rounded-xl border border-border bg-card/80 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">Other</p>
                          <Badge variant="outline">{group.other.length}</Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {group.other.map((media) => (
                            <div key={media.id} className="space-y-2">
                              {renderMediaPreview(media)}
                              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                                <Badge variant="outline">{media.type}</Badge>
                                <span>{media.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {canUpload && activeTask && (
            <div className="space-y-4 border-t border-border pt-6">
              <p className="text-sm font-semibold">Add media to this task</p>
              <Button type="button" onClick={() => openUploadDialog()}>
                Add media
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle>Add media</DialogTitle>
            <DialogDescription>
              Upload multiple attachments under one label. They will be grouped together in the task dialog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-label">Label</Label>
              <Input
                id="upload-label"
                placeholder="Example: RF design draft"
                value={uploadLabel}
                readOnly={uploadLabelLocked}
                onChange={(event) => setUploadLabel(event.target.value)}
              />
              {uploadLabelLocked && (
                <p className="text-xs text-muted-foreground">
                  This label was selected from the group and can't be changed here.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-files">Attachments</Label>
              <p className="text-xs text-muted-foreground">
                Choose one or many images/videos. All selected files will be saved under the same label.
              </p>
              <Input
                ref={uploadInputRef}
                id="upload-files"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(event) =>
                  setSelectedFiles(event.target.files ? Array.from(event.target.files) : [])
                }
              />
              {selectedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Variant</Label>
              <Select
                value={uploadVariant}
                onValueChange={(value) => setUploadVariant(value as TaskMediaVariant)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Variant" />
                </SelectTrigger>
                <SelectContent>
                  {mediaVariantOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 rounded-xl border border-border bg-secondary/25 p-4">
                <p className="text-sm font-semibold">Preview uploads</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedFiles.map((file) => (
                    <div key={file.name} className="rounded-lg border border-border bg-card/80 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p>{file.type || "Unknown type"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleAddMedia}
              disabled={!canUpload || selectedFiles.length === 0 || !uploadLabel.trim()}
            >
              Add attachments
            </Button>
            <Button variant="secondary" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ImageCanvasDialog media={zoomedMedia} onClose={() => setZoomedMedia(null)} />
    </div>
  );
}

export default function PhotosPage() {
  return (
    <React.Suspense fallback={null}>
      <PhotosPageContent />
    </React.Suspense>
  );
}
