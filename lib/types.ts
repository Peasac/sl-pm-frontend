export type Role = "admin" | "client" | "member";

export type User = {
  id?: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
  requiresPasswordChange?: boolean;
};

export type ProjectSummary = {
  name: string;
  client: string;
  companyLogo?: string;
  location: string;
  status: string;
  progress: number;
  startDate: string;
  targetDate: string;
  budget: string;
  nextMilestone: string;
};

export type OverviewStat = {
  label: string;
  value: number;
  detail: string;
};

export type TimelineStatus = "Completed" | "In Progress" | "Pending" | "Blocked";

export type TimelineItem = {
  id: string;
  title: string;
  date: string;
  description: string;
  status: TimelineStatus;
};

export type ScopeItem = {
  title: string;
  description: string;
};

export type TaskStatus = "In Progress" | "Completed" | "Pending" | "Blocked";

export type TaskComment = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

export type TaskPipeline = {
  steps: string[];
  currentStep: number;
};

export type Task = {
  id: string;
  name: string;
  category: string;
  assignee: string;
  timelineStageId: string;
  status: TaskStatus;
  updatedAt: string;
  pipeline: TaskPipeline;
  comments: TaskComment[];
};

export type TaskMediaType = "image" | "video";

export type TaskMediaVariant = "before" | "after" | "other";

export type TaskMediaComment = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

export type TaskMediaItem = {
  id: string;
  taskId: string;
  type: TaskMediaType;
  variant: TaskMediaVariant;
  url: string;
  label: string;
  createdAt: string;
  comments?: TaskMediaComment[];
};

export type ContactTeam = "Starlink Team" | "Client Team";

export type ProjectClientAccess = {
  name: string;
  email: string;
  password: string;
};

export type ProjectClientSelection = {
  existingEmails: string[];
  newClients: Array<{
    name: string;
    email: string;
    password: string;
  }>;
};

export type ClientAccount = Contact & {
  password: string;
  sourceProjectId?: string;
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  email: string;
  team: ContactTeam;
  avatar: string;
  password?: string;
};

export type Project = {
  id: string;
  name: string;
  summary: ProjectSummary;
  clientAccess: ProjectClientAccess[];
  clientAccessIds?: string[];
  overviewStats: OverviewStat[];
  timelineItems: TimelineItem[];
  scopeItems: ScopeItem[];
  tasks: Task[];
  contacts: Contact[];
  taskMedia: TaskMediaItem[];
};

export type CreateProjectInput = {
  name: string;
  startDate: string;
  companyLogo?: string;
  client: ProjectClientSelection;
  members: Omit<Contact, "id">[];
  timelineItems: Array<Omit<TimelineItem, "id">>;
};
