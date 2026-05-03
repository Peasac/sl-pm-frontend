import { Suspense } from "react";
import { TaskTable } from "@/components/tasks/TaskTable";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <TaskTable />
      </Suspense>
    </div>
  );
}
