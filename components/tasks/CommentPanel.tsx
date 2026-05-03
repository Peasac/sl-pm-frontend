"use client";

import * as React from "react";

import { useAppContext } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/lib/types";

export function CommentPanel({ task }: { task: Task }) {
  const { addComment, canComment, user } = useAppContext();
  const [message, setMessage] = React.useState("");

  const handleSubmit = () => {
    if (!message.trim()) {
      return;
    }

    addComment(task.id, {
      author: user?.name ?? "Client user",
      message: message.trim(),
    });
    setMessage("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {task.comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
        {task.comments.map((comment) => (
          <div key={comment.id} className="rounded-lg border border-border bg-secondary/50 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{comment.author}</span>
              <span>{comment.createdAt}</span>
            </div>
            <p className="mt-2 text-sm text-foreground">{comment.message}</p>
          </div>
        ))}
      </div>

      {canComment && (
        <div className="space-y-2">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Add a comment for this task"
          />
          <Button onClick={handleSubmit}>Post comment</Button>
        </div>
      )}
    </div>
  );
}
