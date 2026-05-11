"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type {
  Contact,
  ClientAccount,
  CreateProjectInput,
  Project,
  Role,
  Task,
  TaskComment,
  TaskMediaItem,
  TaskMediaComment,
  TaskStatus,
  TimelineStatus,
  User,
} from "@/lib/types";
import {
  defaultStarlinkMembers,
  getClientAccountsFromProjects,
  getStarlinkMembersFromProjects,
  normalizeProjectClientAccess,
} from "@/lib/project-people";
import { projectCatalog } from "@/lib/mock-data";

const USER_STORAGE_KEY = "slpm:user";
const PROJECTS_STORAGE_KEY = "slpm:projects";
const AUTH_ACCOUNTS_STORAGE_KEY = "slpm:auth-accounts";
const CLIENT_ACCOUNTS_STORAGE_KEY = "slpm:clients";
const STARLINK_MEMBERS_STORAGE_KEY = "slpm:starlink-members";
const DELETED_CLIENT_ACCOUNTS_STORAGE_KEY = "slpm:deleted-clients";
const DELETED_STARLINK_MEMBERS_STORAGE_KEY = "slpm:deleted-starlink-members";
const PROJECT_STORAGE_KEY = "slpm:project";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const formatDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "SL";

const formatDisplayDate = (value?: string | Date) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type AuthAccount = User & {
  password: string;
};

const defaultAuthAccounts: AuthAccount[] = [
  {
    name: "Admina",
    email: "admina@demo.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Client",
    email: "client@demo.com",
    password: "client123",
    role: "client",
  },
  {
    name: "Rina Patel",
    email: "member@demo.com",
    password: "member123",
    role: "member",
  },
];

type AppContextValue = {
  user: User | null;
  role: Role;
  setUser: (user: User | null) => void;
  authAccounts: AuthAccount[];
  projects: Project[];
  activeProjectId: string;
  setActiveProjectId: (projectId: string) => void;
  project: Project | null;
  tasks: Task[];
  contacts: Contact[];
  starlinkMembers: Contact[];
  clientAccounts: ClientAccount[];
  taskMedia: TaskMediaItem[];
  addProject: (project: CreateProjectInput) => Promise<string>;
  addClientAccount: (account: Omit<ClientAccount, "id">) => void;
  addStarlinkMember: (member: Omit<Contact, "id">) => void;
  updateAuthAccountDetails: (
    currentEmail: string,
    details: Pick<User, "name" | "email" | "role">
  ) => void;
  updateAuthAccountPassword: (email: string, password: string) => Promise<void>;
  updateClientAccountDetails: (
    currentEmail: string,
    details: Pick<Contact, "name" | "role" | "email">
  ) => void;
  updateStarlinkMemberDetails: (
    currentEmail: string,
    details: Pick<Contact, "name" | "role" | "email">
  ) => void;
  updateClientAccountPassword: (email: string, password: string) => void;
  updateStarlinkMemberPassword: (email: string, password: string) => void;
  removeClientAccount: (email: string) => void;
  removeStarlinkMember: (email: string) => void;
  addTask: (task: Omit<Task, "id" | "comments" | "updatedAt">) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTimelineStatus: (timelineId: string, status: TimelineStatus) => void;
  addComment: (taskId: string, comment: Omit<TaskComment, "id" | "createdAt">) => void;
  addContact: (contact: Omit<Contact, "id">) => void;
  addTaskMedia: (media: {
    taskId: string;
    variant: TaskMediaItem["variant"];
    label: string;
    file: File;
  }) => Promise<void>;
  addTaskMediaComment: (
    taskId: string,
    mediaId: string,
    comment: Omit<TaskMediaComment, "id" | "createdAt">
  ) => Promise<void>;
  addProjectMember: (memberId: string) => void;
  removeProjectMember: (memberId: string) => void;
  updateProjectDetails: (projectId: string, data: any) => Promise<void>;
  canEdit: boolean;
  canComment: boolean;
  canUpload: boolean;
  canMarkDone: boolean;
  memberName: string | null;
};

const AppContext = React.createContext<AppContextValue | undefined>(undefined);

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const mapUserToContact = (userData: any, fallbackTeam: Contact["team"]): Contact => ({
  id: userData?._id ?? userData?.id ?? createId("contact"),
  name: userData?.name ?? "Unknown",
  role: userData?.title ?? (userData?.role === "member" ? "Member" : "Client Contact"),
  email: userData?.email ?? "",
  team: userData?.team ?? fallbackTeam,
  avatar: userData?.avatar ?? getInitials(userData?.name ?? ""),
});

const mapUserToClientAccount = (userData: any): ClientAccount => ({
  id: userData?._id ?? userData?.id ?? createId("client"),
  name: userData?.name ?? "Client",
  role: userData?.title ?? "Client Contact",
  email: userData?.email ?? "",
  team: "Client Team",
  avatar: userData?.avatar ?? getInitials(userData?.name ?? ""),
  password: "",
});

const mapUserToMember = (userData: any): Contact => ({
  id: userData?._id ?? userData?.id ?? createId("member"),
  name: userData?.name ?? "Member",
  role: userData?.title ?? "Member",
  email: userData?.email ?? "",
  team: "Starlink Team",
  avatar: userData?.avatar ?? getInitials(userData?.name ?? ""),
});

const mapProjectFromApi = (projectData: any): Project => {
  const timelineItems = (projectData.timelineItems ?? []).map((item: any) => ({
    id: item._id ?? createId("timeline"),
    title: item.title,
    date: item.date,
    description: item.description,
    status: item.status,
  }));

  const clients = (projectData.clientAccessIds ?? []).map((client: any) =>
    mapUserToContact(client, "Client Team")
  );

  const members = (projectData.members ?? []).map((member: any) =>
    mapUserToContact(member, "Starlink Team")
  );

  const clientName =
    projectData.summary?.client || clients[0]?.name || projectData.name || "Client";
  const clientAccessIds = (projectData.clientAccessIds ?? [])
    .map((client: any) => client?._id ?? client?.id ?? client)
    .filter(Boolean);

  return normalizeProjectClientAccess({
    id: projectData._id ?? createId("project"),
    name: projectData.name,
    summary: {
      name: projectData.name,
      client: clientName,
      companyLogo: projectData.summary?.companyLogo,
      location: projectData.summary?.location ?? "TBD",
      status: projectData.summary?.status ?? "Planning",
      progress: projectData.summary?.progress ?? 0,
      startDate: formatDisplayDate(projectData.summary?.startDate),
      targetDate: formatDisplayDate(projectData.summary?.targetDate),
      budget: projectData.summary?.budget ?? "TBD",
      nextMilestone: projectData.summary?.nextMilestone ?? "Kickoff",
    },
    clientAccess: clients.map((client: Contact) => ({
      name: client.name,
      email: client.email,
      password: "",
    })),
    clientAccessIds,
    overviewStats: projectData.overviewStats ?? [],
    timelineItems,
    scopeItems: [],
    tasks: [],
    contacts: [...clients, ...members],
    taskMedia: [],
  });
};

const mapTaskFromApi = (taskData: any): Task => {
  const assigneeName =
    taskData.assigneeName || taskData.assigneeId?.name || taskData.assignee || "Unassigned";

  return {
    id: taskData._id ?? createId("task"),
    name: taskData.name,
    category: taskData.category ?? "",
    assignee: assigneeName,
    timelineStageId: taskData.timelineStageId ?? "",
    status: taskData.status ?? "Pending",
    updatedAt: formatDisplayDate(taskData.updatedAt),
    pipeline: taskData.pipeline ?? { steps: ["Plan", "Build", "Launch"], currentStep: 0 },
    comments: (taskData.comments ?? []).map((comment: any) => ({
      id: comment._id ?? createId("comment"),
      author: comment.authorId?.name ?? "Unknown",
      message: comment.message,
      createdAt: formatDisplayDate(comment.createdAt),
    })),
  };
};

const mapMediaFromApi = (mediaData: any): TaskMediaItem => ({
  id: mediaData._id ?? createId("media"),
  taskId: mediaData.taskId,
  type: mediaData.type,
  variant: mediaData.variant,
  url: mediaData.url,
  label: mediaData.label,
  createdAt: formatDisplayDate(mediaData.createdAt),
  comments: (mediaData.comments ?? []).map((comment: any) => ({
    id: comment._id ?? createId("media-comment"),
    author: comment.authorId?.name ?? "Unknown",
    message: comment.message,
    createdAt: formatDisplayDate(comment.createdAt),
  })),
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const hasCheckedAuthRef = React.useRef(false);
  const [authAccounts, setAuthAccounts] = React.useState<AuthAccount[]>(defaultAuthAccounts);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [clientAccounts, setClientAccounts] = React.useState<ClientAccount[]>([]);
  const [starlinkMembers, setStarlinkMembers] = React.useState<Contact[]>(defaultStarlinkMembers);
  const [deletedClientEmails, setDeletedClientEmails] = React.useState<string[]>([]);
  const [deletedStarlinkEmails, setDeletedStarlinkEmails] = React.useState<string[]>([]);
  const [activeProjectId, setActiveProjectId] = React.useState<string>("");
  
  const pathname = usePathname();

  React.useEffect(() => {
    const token = window.localStorage.getItem("slpm:token");
    if (!token) {
      setUser(null);
      window.localStorage.removeItem(USER_STORAGE_KEY);
      setAuthChecked(true);
      setAuthError(null);
      if (pathname !== "/login") {
        window.location.replace("/login");
      }
      return;
    }

    if (!API_BASE) {
      setAuthError("API base URL is not configured.");
      setAuthChecked(true);
      return;
    }
    if (hasCheckedAuthRef.current) {
      return;
    }
    hasCheckedAuthRef.current = true;

    let isActive = true;
    const loadUser = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();
        if (isActive && data?.user) {
          setUser({
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            title: data.user.title,
            requiresPasswordChange: Boolean(data.user.requiresPasswordChange),
          });
          setAuthError(null);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[AppProvider] /auth/me failed", error, { API_BASE });
        if ((error as Error)?.name === "AbortError") {
          setAuthError("Auth check timed out. Please try again.");
        } else {
          setAuthError("Auth check failed. Please sign in again.");
          window.localStorage.removeItem("slpm:token");
          setUser(null);
          window.localStorage.removeItem(USER_STORAGE_KEY);
          if (pathname !== "/login") {
            window.location.replace("/login");
          }
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (isActive) {
          setAuthChecked(true);
        }
      }
    };

    loadUser();

    return () => {
      isActive = false;
    };
  }, []);

  // Separate effect: redirect to login if auth check is done and no user
  React.useEffect(() => {
    if (authChecked && !user && !authError && pathname !== "/login") {
      window.location.replace("/login");
    }
  }, [authChecked, user, authError, pathname]);

  React.useEffect(() => {
    const token = window.localStorage.getItem("slpm:token");
    if (!token) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      return;
    }
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  React.useEffect(() => {
    const token = window.localStorage.getItem("slpm:token");
    if (!user || !token || !API_BASE) {
      return;
    }

    const loadProjects = async () => {
      try {
        const response = await fetch(`${API_BASE}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const mappedProjects = data.data.map((project: any) => mapProjectFromApi(project));
          if (mappedProjects.length > 0) {
            setProjects(mappedProjects);
            setActiveProjectId((prev) =>
              mappedProjects.some((p: any) => p.id === prev) ? prev : mappedProjects[0].id
            );
          }
        }
      } catch (error) {
        console.error("Failed to load projects", error);
      }
    };

    const loadDirectories = async () => {
      if (user.role !== "admin") {
        return;
      }

      try {
        const [membersRes, clientsRes] = await Promise.all([
          fetch(`${API_BASE}/users?role=member`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/users?role=client`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const membersData = await membersRes.json();
        const clientsData = await clientsRes.json();

        if (membersData.success && Array.isArray(membersData.data)) {
          setStarlinkMembers(membersData.data.map(mapUserToMember));
        }
        if (clientsData.success && Array.isArray(clientsData.data)) {
          setClientAccounts(clientsData.data.map(mapUserToClientAccount));
        }
      } catch (error) {
        console.error("Failed to load user directories", error);
      }
    };

    loadProjects();
    loadDirectories();
  }, [API_BASE, user?.id]);

  React.useEffect(() => {
    const storedAuthAccounts = window.localStorage.getItem(AUTH_ACCOUNTS_STORAGE_KEY);
    if (storedAuthAccounts) {
      try {
        const parsedAuthAccounts = JSON.parse(storedAuthAccounts) as AuthAccount[];
        if (Array.isArray(parsedAuthAccounts) && parsedAuthAccounts.length) {
          setAuthAccounts(parsedAuthAccounts);
        }
      } catch {
        window.localStorage.removeItem(AUTH_ACCOUNTS_STORAGE_KEY);
      }
    }

    const storedProjects = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    let parsedProjects: Project[] | null = null;
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects) as Project[];
        if (Array.isArray(parsed) && parsed.length) {
          parsedProjects = parsed.map(normalizeProjectClientAccess);
          setProjects(parsedProjects);
        }
      } catch {
        window.localStorage.removeItem(PROJECTS_STORAGE_KEY);
      }
    }

    const storedClients = window.localStorage.getItem(CLIENT_ACCOUNTS_STORAGE_KEY);
    if (storedClients) {
      try {
        const parsedClients = JSON.parse(storedClients) as ClientAccount[];
        if (Array.isArray(parsedClients) && parsedClients.length) {
          setClientAccounts(parsedClients);
        }
      } catch {
        window.localStorage.removeItem(CLIENT_ACCOUNTS_STORAGE_KEY);
      }
    }

    const storedStarlinkMembers = window.localStorage.getItem(STARLINK_MEMBERS_STORAGE_KEY);
    if (storedStarlinkMembers) {
      try {
        const parsedMembers = JSON.parse(storedStarlinkMembers) as Contact[];
        if (Array.isArray(parsedMembers) && parsedMembers.length) {
          setStarlinkMembers(parsedMembers);
        }
      } catch {
        window.localStorage.removeItem(STARLINK_MEMBERS_STORAGE_KEY);
      }
    }

    const storedDeletedClients = window.localStorage.getItem(DELETED_CLIENT_ACCOUNTS_STORAGE_KEY);
    if (storedDeletedClients) {
      try {
        const parsedDeletedClients = JSON.parse(storedDeletedClients) as string[];
        if (Array.isArray(parsedDeletedClients)) {
          setDeletedClientEmails(parsedDeletedClients);
        }
      } catch {
        window.localStorage.removeItem(DELETED_CLIENT_ACCOUNTS_STORAGE_KEY);
      }
    }

    const storedDeletedStarlink = window.localStorage.getItem(
      DELETED_STARLINK_MEMBERS_STORAGE_KEY
    );
    if (storedDeletedStarlink) {
      try {
        const parsedDeletedStarlink = JSON.parse(storedDeletedStarlink) as string[];
        if (Array.isArray(parsedDeletedStarlink)) {
          setDeletedStarlinkEmails(parsedDeletedStarlink);
        }
      } catch {
        window.localStorage.removeItem(DELETED_STARLINK_MEMBERS_STORAGE_KEY);
      }
    }

    const storedActiveProject = window.localStorage.getItem(PROJECT_STORAGE_KEY);
    if (
      storedActiveProject &&
      (projectCatalog.some((project) => project.id === storedActiveProject) ||
        parsedProjects?.some((project) => project.id === storedActiveProject))
    ) {
      setActiveProjectId(storedActiveProject);
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(AUTH_ACCOUNTS_STORAGE_KEY, JSON.stringify(authAccounts));
  }, [authAccounts]);

  React.useEffect(() => {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  React.useEffect(() => {
    const projectClients = getClientAccountsFromProjects(projects).filter(
      (account) => !deletedClientEmails.includes(account.email)
    );
    setClientAccounts((previousClients) => {
      const accountsByEmail = new Map<string, ClientAccount>();
      [...previousClients, ...projectClients].forEach((account) => {
        if (deletedClientEmails.includes(account.email)) {
          return;
        }
        accountsByEmail.set(account.email, account);
      });
      return Array.from(accountsByEmail.values());
    });
  }, [deletedClientEmails, projects]);

  React.useEffect(() => {
    const projectMembers = getStarlinkMembersFromProjects(projects).filter(
      (member) => !deletedStarlinkEmails.includes(member.email)
    );
    setStarlinkMembers((previousMembers) => {
      const membersByEmail = new Map<string, Contact>();
      [...previousMembers, ...projectMembers].forEach((member) => {
        if (deletedStarlinkEmails.includes(member.email)) {
          return;
        }
        membersByEmail.set(member.email, member);
      });
      return Array.from(membersByEmail.values());
    });
  }, [deletedStarlinkEmails, projects]);

  React.useEffect(() => {
    window.localStorage.setItem(CLIENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(clientAccounts));
  }, [clientAccounts]);

  React.useEffect(() => {
    window.localStorage.setItem(STARLINK_MEMBERS_STORAGE_KEY, JSON.stringify(starlinkMembers));
  }, [starlinkMembers]);

  React.useEffect(() => {
    window.localStorage.setItem(
      DELETED_CLIENT_ACCOUNTS_STORAGE_KEY,
      JSON.stringify(deletedClientEmails)
    );
  }, [deletedClientEmails]);

  React.useEffect(() => {
    window.localStorage.setItem(
      DELETED_STARLINK_MEMBERS_STORAGE_KEY,
      JSON.stringify(deletedStarlinkEmails)
    );
  }, [deletedStarlinkEmails]);

  React.useEffect(() => {
    if (!projects.length) {
      return;
    }
    if (!projects.some((project) => project.id === activeProjectId)) {
      setActiveProjectId(projects[0]?.id ?? "");
    }
  }, [projects, activeProjectId]);

  React.useEffect(() => {
    if (activeProjectId) {
      window.localStorage.setItem(PROJECT_STORAGE_KEY, activeProjectId);
    }
  }, [activeProjectId]);

  const activeProject = React.useMemo(() => {
    return projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null;
  }, [projects, activeProjectId]);

  const role: Role = user?.role ?? "client";
  const canEdit = role === "admin";
  const canComment = Boolean(user);
  const canUpload = Boolean(user);
  const canMarkDone = role === "admin";
  const memberName = role === "member" ? (user?.name ?? null) : null;

  const tasks = activeProject?.tasks ?? [];
  const contacts = activeProject?.contacts ?? [];
  const taskMedia = activeProject?.taskMedia ?? [];

  const updateProject = React.useCallback(
    (projectId: string, updater: (project: Project) => Project) => {
      setProjects((prev) =>
        prev.map((project) => (project.id === projectId ? updater(project) : project))
      );
    },
    []
  );

  React.useEffect(() => {
    const token = window.localStorage.getItem("slpm:token");
    if (!activeProjectId || !user || !token || !API_BASE) {
      return;
    }

    const abortController = new AbortController();
    let isActive = true;

    const loadTasksAndMedia = async () => {
      try {
        const taskResponse = await fetch(`${API_BASE}/projects/${activeProjectId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });
        const taskData = await taskResponse.json();
        if (!isActive) return;
        if (!taskData.success || !Array.isArray(taskData.data)) {
          return;
        }

        const mappedTasks = taskData.data.map(mapTaskFromApi);

        const mediaResponses = await Promise.all(
          mappedTasks.map((task: Task) =>
            fetch(`${API_BASE}/projects/${activeProjectId}/tasks/${task.id}/media`, {
              headers: { Authorization: `Bearer ${token}` },
              signal: abortController.signal,
            })
          )
        );

        if (!isActive) return;
        const mediaPayloads = await Promise.all(mediaResponses.map((res) => res.json()));
        const mappedMedia = mediaPayloads
          .filter((payload) => payload.success && Array.isArray(payload.data))
          .flatMap((payload) => payload.data.map(mapMediaFromApi));

        if (isActive) {
          updateProject(activeProjectId, (project) => ({
            ...project,
            tasks: mappedTasks,
            taskMedia: mappedMedia,
          }));
        }
      } catch (error) {
        if (isActive && error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to load tasks", error);
        }
      }
    };

    loadTasksAndMedia();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [API_BASE, activeProjectId, updateProject, user]);

  const addProject = React.useCallback(async (project: CreateProjectInput) => {
    const projectId = createId("project");
    const timelineItems = project.timelineItems
      .filter((item) => item.title.trim() || item.date.trim() || item.description.trim())
      .map((item) => ({
        ...item,
        id: createId("timeline"),
      }));
    const formattedStartDate = formatDate(project.startDate);
    const completedCount = timelineItems.filter((item) => item.status === "Completed").length;
    const inProgressCount = timelineItems.filter((item) => item.status === "In Progress").length;
    const pendingCount = timelineItems.filter((item) => item.status === "Pending").length;
    const progress = timelineItems.length
      ? Math.round((completedCount / timelineItems.length) * 100)
      : 0;
    const nextMilestone =
      timelineItems.find((item) => item.status !== "Completed")?.title ??
      timelineItems[0]?.title ??
      "Kickoff";
    const summaryStatus =
      progress === 100 ? "Completed" : completedCount > 0 || inProgressCount > 0 ? "In Progress" : "Planning";

    const selectedExistingClients = project.client.existingEmails.map(email => 
      clientAccounts.find(acc => acc.email === email)
    ).filter(Boolean) as ClientAccount[];

    const clientContacts: Contact[] = selectedExistingClients.map(client => ({
      ...client,
      id: createId("contact"),
    }));

    const newClientContacts: Contact[] = project.client.newClients.map(client => ({
      id: createId("contact"),
      name: client.name,
      role: "Client Contact",
      email: client.email,
      team: "Client Team",
      avatar: getInitials(client.name),
    }));

    const contacts: Contact[] = [
      ...clientContacts,
      ...newClientContacts,
      ...project.members.map((member) => ({
        ...member,
        id: createId("contact"),
      })),
    ];

    if (project.client.newClients.length > 0) {
      setClientAccounts((previousClients) => {
        const newlyAdded = project.client.newClients.map(
          (client): ClientAccount => ({
            id: createId("client"),
            name: client.name,
            role: "Client Contact",
            email: client.email,
            team: "Client Team",
            avatar: getInitials(client.name),
            password: client.password,
            sourceProjectId: projectId,
          })
        );
        return [...newlyAdded, ...previousClients.filter(acc => !newlyAdded.some(n => n.email === acc.email))];
      });
    }

    const nextProject: Project = {
      id: projectId,
      name: project.name,
      clientAccess: [
        ...selectedExistingClients.map(c => ({ name: c.name, email: c.email, password: c.password })),
        ...project.client.newClients.map(c => ({ name: c.name, email: c.email, password: c.password }))
      ],
      clientAccessIds: selectedExistingClients.map((client) => client.id),
      summary: {
        name: project.name,
        client: selectedExistingClients[0]?.name || project.client.newClients[0]?.name || "Client",
        companyLogo: project.companyLogo,
        location: "TBD",
        status: summaryStatus,
        progress,
        startDate: formattedStartDate,
        targetDate: timelineItems.at(-1)?.date ?? formattedStartDate,
        budget: "TBD",
        nextMilestone,
      },
      overviewStats: [
        { label: "Completed", value: completedCount, detail: "Milestones" },
        { label: "In Progress", value: inProgressCount, detail: "Active streams" },
        { label: "Pending", value: pendingCount, detail: "Approvals" },
      ],
      timelineItems,
      scopeItems: [],
      tasks: [],
      contacts,
      taskMedia: [],
    };

    setProjects((prev) => [nextProject, ...prev]);
    setActiveProjectId(projectId);

    const token = window.localStorage.getItem("slpm:token");
    if (!token || !API_BASE) {
      return projectId;
    }

    try {
      const existingClientIds = project.client.existingEmails
        .map(email => clientAccounts.find(acc => acc.email === email)?.id)
        .filter(Boolean);

      const newClientIds = await Promise.all(
        project.client.newClients.map(async (client) => {
          const response = await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              ...client,
              role: "client",
              team: "Client Team",
              title: "Client Contact",
              avatar: getInitials(client.name),
            }),
          });
          const created = await response.json();
          if (response.ok && created.success) {
            setClientAccounts((prev) => [mapUserToClientAccount(created.data), ...prev]);
            return created.data.id;
          }
          return null;
        })
      );

      const allClientIds = [...existingClientIds, ...newClientIds.filter(Boolean)];

      const memberIds = project.members
        .map((member) => (member as Contact).id)
        .filter(Boolean);

      const projectResponse = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: project.name,
          summary: nextProject.summary,
          overviewStats: nextProject.overviewStats,
          timelineItems: nextProject.timelineItems.map(({ id, ...rest }) => rest),
          members: memberIds,
          clientAccessIds: allClientIds,
        }),
      });

      const projectPayload = await projectResponse.json();
      if (projectResponse.ok && projectPayload.success && projectPayload.data) {
        const mappedProject = mapProjectFromApi(projectPayload.data);
        setProjects((prev) => [mappedProject, ...prev.filter((p) => p.id !== projectId)]);
        setActiveProjectId(mappedProject.id);
      }
    } catch (error) {
      console.error("Failed to create project in backend", error);
    }

    return projectId;
  }, [API_BASE, clientAccounts]);

  const updateProjectDetails = React.useCallback(async (projectId: string, data: any) => {
    const token = window.localStorage.getItem("slpm:token");
    if (!token || !API_BASE) {
      // Fallback to local update
      updateProject(projectId, (p) => ({ ...p, ...data }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      const payload = await response.json();
      if (response.ok && payload.success && payload.data) {
        const mapped = mapProjectFromApi(payload.data);
        setProjects((prev) => prev.map((p) => (p.id === projectId ? mapped : p)));
      }
    } catch (error) {
      console.error("Failed to update project details", error);
    }
  }, [API_BASE, updateProject]);

  const addClientAccount = React.useCallback((account: Omit<ClientAccount, "id">) => {
    if (clientAccounts.some((existing) => existing.email === account.email)) {
      return;
    }

    setDeletedClientEmails((previousDeleted) =>
      previousDeleted.filter((email) => email !== account.email)
    );
    setClientAccounts((previousClients) => [
      {
        ...account,
        id: createId("client"),
      },
      ...previousClients.filter((existing) => existing.email !== account.email),
    ]);
    setAuthAccounts((previousAccounts) => [
      {
        name: account.name,
        email: account.email,
        role: "client",
        password: account.password,
      },
      ...previousAccounts.filter((existing) => existing.email !== account.email),
    ]);

    const token = window.localStorage.getItem("slpm:token");
    if (!token || !API_BASE) {
      return;
    }

    fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: account.name,
        email: account.email,
        password: account.password,
        role: "client",
        team: "Client Team",
        title: account.role,
        avatar: account.avatar,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data) {
          setClientAccounts((prev) => [mapUserToClientAccount(data.data), ...prev.filter((c) => c.email !== account.email)]);
        }
      })
      .catch((error) => console.error("Failed to create client", error));
  }, [API_BASE, clientAccounts]);

  const addStarlinkMember = React.useCallback((member: Omit<Contact, "id">) => {
    if (starlinkMembers.some((existing) => existing.email === member.email)) {
      return;
    }

    setDeletedStarlinkEmails((previousDeleted) =>
      previousDeleted.filter((email) => email !== member.email)
    );
    setStarlinkMembers((previousMembers) => [
      {
        ...member,
        id: createId("member"),
      },
      ...previousMembers.filter((existing) => existing.email !== member.email),
    ]);
    setAuthAccounts((previousAccounts) => [
      {
        name: member.name,
        email: member.email,
        role: "member",
        password: member.password ?? "",
      },
      ...previousAccounts.filter((existing) => existing.email !== member.email),
    ]);

    const token = window.localStorage.getItem("slpm:token");
    if (!token || !API_BASE) {
      return;
    }

    fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: member.name,
        email: member.email,
        password: member.password ?? "",
        role: "member",
        team: "Starlink Team",
        title: member.role,
        avatar: member.avatar,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data) {
          setStarlinkMembers((prev) => [mapUserToMember(data.data), ...prev.filter((m) => m.email !== member.email)]);
        }
      })
      .catch((error) => console.error("Failed to create member", error));
  }, [API_BASE, starlinkMembers]);

  const updateAuthAccountDetails = React.useCallback(
    (currentEmail: string, details: Pick<User, "name" | "email" | "role">) => {
      setAuthAccounts((previousAccounts) =>
        previousAccounts.map((account) =>
          account.email === currentEmail
            ? {
                ...account,
                name: details.name,
                email: details.email,
                role: details.role,
              }
            : account
        )
      );

      setUser((currentUser) =>
        currentUser?.email === currentEmail
          ? {
              ...currentUser,
              name: details.name,
              email: details.email,
              role: details.role,
            }
          : currentUser
      );

      const token = window.localStorage.getItem("slpm:token");
      if (token && API_BASE) {
        // Find the user ID from the currently logged in user to update
        const currentUserId = user?.email === currentEmail ? user?.id : undefined;
        if (currentUserId) {
          fetch(`${API_BASE}/users/${currentUserId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name: details.name,
              email: details.email,
              role: details.role,
            }),
          }).catch((error) => console.error("Failed to update profile", error));
        }
      }
    },
    [API_BASE, user]
  );

  const updateAuthAccountPassword = React.useCallback(async (email: string, password: string) => {
    setAuthAccounts((previousAccounts) =>
      previousAccounts.map((account) =>
        account.email === email
          ? {
              ...account,
              password,
            }
          : account
      )
    );

    const token = window.localStorage.getItem("slpm:token");
    if (!token || !API_BASE) {
      throw new Error("Not authenticated");
    }

    const currentUserId = user?.email === email ? user?.id : undefined;
    if (!currentUserId) {
      throw new Error("User ID not found");
    }

    const response = await fetch(`${API_BASE}/users/${currentUserId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error("Failed to update password");
    }
  }, [API_BASE, user]);

  const updateClientAccountDetails = React.useCallback(
    (currentEmail: string, details: Pick<Contact, "name" | "role" | "email">) => {
      const accountToUpdate = clientAccounts.find((account) => account.email === currentEmail);
      const nextAvatar = getInitials(details.name);

      setClientAccounts((previousClients) =>
        previousClients.map((account) =>
          account.email === currentEmail
            ? {
                ...account,
                name: details.name,
                role: details.role,
                email: details.email,
                avatar: nextAvatar,
              }
            : account
        )
      );

      setAuthAccounts((previousAccounts) =>
        previousAccounts.map((account) =>
          account.email === currentEmail
            ? {
                ...account,
                name: details.name,
                email: details.email,
                role: "client",
              }
            : account
        )
      );

      setUser((currentUser) =>
        currentUser?.email === currentEmail
          ? {
              ...currentUser,
              name: details.name,
              email: details.email,
            }
          : currentUser
      );

      setProjects((previousProjects) =>
        previousProjects.map((project) => {
          const shouldUpdateClient = project.clientAccess.some(
            (client) => client.email === currentEmail
          );
          const nextClientAccess = shouldUpdateClient
            ? project.clientAccess.map((client) =>
                client.email === currentEmail
                  ? { ...client, name: details.name, email: details.email }
                  : client
              )
            : project.clientAccess;

          return {
            ...project,
            clientAccess: nextClientAccess,
            contacts: project.contacts.map((contact) =>
              contact.email === currentEmail && contact.team === "Client Team"
                ? {
                    ...contact,
                    name: details.name,
                    role: details.role,
                    email: details.email,
                    avatar: nextAvatar,
                  }
                : contact
            ),
            summary: shouldUpdateClient
              ? {
                  ...project.summary,
                  client: details.name,
                }
              : project.summary,
          };
        })
      );

      const token = window.localStorage.getItem("slpm:token");
      if (token && API_BASE && accountToUpdate?.id) {
        fetch(`${API_BASE}/users/${accountToUpdate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: details.name,
            email: details.email,
            title: details.role,
            role: "client",
            team: "Client Team",
            avatar: nextAvatar,
          }),
        }).catch((error) => console.error("Failed to update client", error));
      }
    },
    [API_BASE, clientAccounts]
  );

  const updateStarlinkMemberDetails = React.useCallback(
    (currentEmail: string, details: Pick<Contact, "name" | "role" | "email">) => {
      const memberToUpdate = starlinkMembers.find((member) => member.email === currentEmail);
      const nextAvatar = getInitials(details.name);

      setStarlinkMembers((previousMembers) =>
        previousMembers.map((member) =>
          member.email === currentEmail
            ? {
                ...member,
                name: details.name,
                role: details.role,
                email: details.email,
                avatar: nextAvatar,
              }
            : member
        )
      );

      setAuthAccounts((previousAccounts) =>
        previousAccounts.map((account) =>
          account.email === currentEmail
            ? {
                ...account,
                name: details.name,
                email: details.email,
                role: "member",
              }
            : account
        )
      );

      setUser((currentUser) =>
        currentUser?.email === currentEmail
          ? {
              ...currentUser,
              name: details.name,
              email: details.email,
            }
          : currentUser
      );

      setProjects((previousProjects) =>
        previousProjects.map((project) => ({
          ...project,
          contacts: project.contacts.map((contact) =>
            contact.email === currentEmail && contact.team === "Starlink Team"
              ? {
                  ...contact,
                  name: details.name,
                  role: details.role,
                  email: details.email,
                  avatar: nextAvatar,
                }
              : contact
          ),
        }))
      );

      const token = window.localStorage.getItem("slpm:token");
      if (token && API_BASE && memberToUpdate?.id) {
        fetch(`${API_BASE}/users/${memberToUpdate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: details.name,
            email: details.email,
            title: details.role,
            role: "member",
            team: "Starlink Team",
            avatar: nextAvatar,
          }),
        }).catch((error) => console.error("Failed to update member", error));
      }
    },
    [API_BASE, starlinkMembers]
  );

  const updateClientAccountPassword = React.useCallback((email: string, password: string) => {
    const accountToUpdate = clientAccounts.find((account) => account.email === email);
    setClientAccounts((previousClients) =>
      previousClients.map((account) =>
        account.email === email
          ? {
              ...account,
              password,
            }
          : account
      )
    );

    setAuthAccounts((previousAccounts) =>
      previousAccounts.map((account) =>
        account.email === email
          ? {
              ...account,
              password,
            }
          : account
      )
    );

    setProjects((previousProjects) =>
      previousProjects.map((project) => {
        const matchesClientAccess = project.clientAccess.some((client) => client.email === email);
        if (!matchesClientAccess) {
          return project;
        }
        return {
          ...project,
          clientAccess: project.clientAccess.map((client) =>
            client.email === email ? { ...client, password } : client
          ),
          contacts: project.contacts.map((contact) =>
            contact.email === email
              ? {
                  ...contact,
                  password,
                }
              : contact
          ),
        };
      })
    );

    const token = window.localStorage.getItem("slpm:token");
    if (token && API_BASE && accountToUpdate?.id) {
      fetch(`${API_BASE}/users/${accountToUpdate.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      }).catch((error) => console.error("Failed to update client password", error));
    }
  }, [API_BASE, clientAccounts]);

  const updateStarlinkMemberPassword = React.useCallback((email: string, password: string) => {
    const memberToUpdate = starlinkMembers.find((member) => member.email === email);
    setStarlinkMembers((previousMembers) =>
      previousMembers.map((member) =>
        member.email === email
          ? {
              ...member,
              password,
            }
          : member
      )
    );

    setAuthAccounts((previousAccounts) =>
      previousAccounts.map((account) =>
        account.email === email
          ? {
              ...account,
              password,
            }
          : account
      )
    );

    setProjects((previousProjects) =>
      previousProjects.map((project) => ({
        ...project,
        contacts: project.contacts.map((contact) =>
          contact.email === email
            ? {
                ...contact,
                password,
              }
            : contact
        ),
      }))
    );

    const token = window.localStorage.getItem("slpm:token");
    if (token && API_BASE && memberToUpdate?.id) {
      fetch(`${API_BASE}/users/${memberToUpdate.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      }).catch((error) => console.error("Failed to update member password", error));
    }
  }, [API_BASE, starlinkMembers]);

  const removeClientAccount = React.useCallback((email: string) => {
    setDeletedClientEmails((previousDeleted) =>
      previousDeleted.includes(email) ? previousDeleted : [email, ...previousDeleted]
    );
    setClientAccounts((previousClients) => previousClients.filter((account) => account.email !== email));
    setAuthAccounts((previousAccounts) =>
      previousAccounts.filter((account) => account.email !== email)
    );
  }, []);

  const removeStarlinkMember = React.useCallback((email: string) => {
    setDeletedStarlinkEmails((previousDeleted) =>
      previousDeleted.includes(email) ? previousDeleted : [email, ...previousDeleted]
    );
    setStarlinkMembers((previousMembers) => previousMembers.filter((member) => member.email !== email));
    setAuthAccounts((previousAccounts) =>
      previousAccounts.filter((account) => account.email !== email)
    );
  }, []);

  const updateTimelineStatus = React.useCallback(
    (timelineId: string, status: TimelineStatus) => {
      if (!activeProjectId) {
        return;
      }
      updateProject(activeProjectId, (project) => ({
        ...project,
        timelineItems: project.timelineItems.map((item) =>
          item.id === timelineId
            ? {
                ...item,
                status,
              }
            : item
        ),
      }));

      const token = window.localStorage.getItem("slpm:token");
      if (token && API_BASE) {
        fetch(`${API_BASE}/projects/${activeProjectId}/timeline/${timelineId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        }).catch((error) => console.error("Failed to update timeline status", error));
      }
    },
    [API_BASE, activeProjectId, updateProject]
  );

  const addTask = React.useCallback(
    async (task: Omit<Task, "id" | "comments" | "updatedAt">) => {
      if (!activeProjectId) {
        return;
      }
      const fakeId = createId("task");
      const assigneeMatch = starlinkMembers.find(
        (member) => member.name.toLowerCase() === task.assignee.toLowerCase()
      );
      updateProject(activeProjectId, (project) => ({
        ...project,
        tasks: [
          {
            ...task,
            id: fakeId,
            updatedAt: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            comments: [],
          },
          ...project.tasks,
        ],
        timelineItems: project.timelineItems.map((item) =>
          item.id === task.timelineStageId && (item.status === "Pending" || item.status === "Completed")
            ? { ...item, status: "In Progress", date: item.status === "Pending" ? new Date().toISOString().split('T')[0] : item.date }
            : item
        ),
      }));

      try {
        const token = window.localStorage.getItem("slpm:token");
        const response = await fetch(`${API_BASE}/projects/${activeProjectId}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...task,
            assigneeId: assigneeMatch?.id,
            assigneeName: task.assignee,
          })
        });
        const payload = await response.json();
        if (response.ok && payload.success && payload.data) {
          const mappedTask = mapTaskFromApi(payload.data);
          updateProject(activeProjectId, (project) => {
            const stage = project.timelineItems.find((item) => item.id === task.timelineStageId);
            if (stage && (stage.status === "Pending" || stage.status === "Completed")) {
              // Also update timeline status in backend
              fetch(`${API_BASE}/projects/${activeProjectId}/timeline/${task.timelineStageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "In Progress", date: stage.status === "Pending" ? new Date().toISOString().split('T')[0] : stage.date }),
              }).catch(e => console.error("Failed to update timeline status", e));
            }
            
            return {
              ...project,
              tasks: [
                mappedTask,
                ...project.tasks.filter((existing) => existing.id !== fakeId),
              ],
            };
          });
        }
      } catch (error) {
        console.error("Failed to add task to backend:", error);
      }
    },
    [API_BASE, activeProjectId, starlinkMembers, updateProject]
  );

  const updateTaskStatus = React.useCallback(async (taskId: string, status: TaskStatus) => {
    if (!activeProjectId) {
      return;
    }
    updateProject(activeProjectId, (project) => ({
      ...project,
      tasks: project.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : task
      ),
      timelineItems: project.timelineItems.map((item) => {
        const stageTasks = project.tasks
          .map((task) => (task.id === taskId ? { ...task, status } : task))
          .filter((task) => task.timelineStageId === item.id);

        if (stageTasks.length === 0) {
          return item;
        }

        const allDone = stageTasks.every((task) => task.status === "Completed");
        const anyActive = stageTasks.some((task) => task.status === "In Progress" || task.status === "Blocked");
        const nextStatus = allDone ? "Completed" : anyActive ? "In Progress" : "Pending";

        if (item.id === stageTasks[0].timelineStageId && nextStatus !== item.status) {
          const newDate = (item.status === "Pending" && nextStatus === "In Progress") ? new Date().toISOString().split('T')[0] : item.date;
          
          // Fire API call asynchronously
          const token = window.localStorage.getItem("slpm:token");
          if (token && API_BASE) {
            fetch(`${API_BASE}/projects/${activeProjectId}/timeline/${item.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ status: nextStatus, date: newDate }),
            }).catch(e => console.error("Failed to update timeline status on task change", e));
          }

          return { ...item, status: nextStatus, date: newDate };
        }

        return item;
      }),
    }));

    try {
      const token = window.localStorage.getItem("slpm:token");
      await fetch(`${API_BASE}/projects/${activeProjectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error("Failed to update task status in backend:", error);
    }
  }, [API_BASE, activeProjectId, updateProject]);

  const addComment = React.useCallback(
    async (taskId: string, comment: Omit<TaskComment, "id" | "createdAt">) => {
      if (!activeProjectId) {
        return;
      }
      updateProject(activeProjectId, (project) => ({
        ...project,
        tasks: project.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                comments: [
                  {
                    ...comment,
                    id: createId("comment"),
                    createdAt: new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                  },
                  ...task.comments,
                ],
              }
            : task
        ),
      }));

      try {
        const token = window.localStorage.getItem("slpm:token");
        await fetch(`${API_BASE}/projects/${activeProjectId}/tasks/${taskId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message: comment.message })
        });
      } catch (error) {
        console.error("Failed to add comment to backend:", error);
      }
    },
    [API_BASE, activeProjectId, updateProject]
  );

  const addContact = React.useCallback((contact: Omit<Contact, "id">) => {
    if (!activeProjectId) {
      return;
    }
    updateProject(activeProjectId, (project) => ({
      ...project,
      contacts: [
        {
          ...contact,
          id: createId("contact"),
        },
        ...project.contacts,
      ],
    }));
  }, [activeProjectId, updateProject]);

  const addProjectMember = React.useCallback((memberId: string) => {
    if (!activeProjectId) {
      return;
    }
    const member = starlinkMembers.find((m) => m.id === memberId);
    if (!member) {
      return;
    }
    if (member.role.toLowerCase() === "admin") {
      return;
    }
    updateProject(activeProjectId, (project) => {
      const alreadyExists = project.contacts.some(
        (c) => c.email === member.email && c.team === "Starlink Team"
      );
      if (alreadyExists) {
        return project;
      }
      return {
        ...project,
        contacts: [
          {
            ...member,
            id: createId("contact"),
          },
          ...project.contacts,
        ],
      };
    });
    const token = window.localStorage.getItem("slpm:token");
    if (token && API_BASE) {
      fetch(`${API_BASE}/projects/${activeProjectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ memberId }),
      }).catch((error) => console.error("Failed to add project member", error));
    }
  }, [API_BASE, activeProjectId, starlinkMembers, updateProject]);

  const removeProjectMember = React.useCallback((contactId: string) => {
    if (!activeProjectId) {
      return;
    }
    const targetContact = activeProject?.contacts.find((contact) => contact.id === contactId);
    const memberId = targetContact
      ? starlinkMembers.find((member) => member.email === targetContact.email)?.id
      : undefined;
    updateProject(activeProjectId, (project) => ({
      ...project,
      contacts: project.contacts.filter((c) => c.id !== contactId),
    }));
    const token = window.localStorage.getItem("slpm:token");
    if (token && API_BASE && memberId) {
      fetch(`${API_BASE}/projects/${activeProjectId}/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("Failed to remove project member", error));
    }
  }, [API_BASE, activeProject, activeProjectId, starlinkMembers, updateProject]);

  const addTaskMedia = React.useCallback(async (media: {
    taskId: string;
    variant: TaskMediaItem["variant"];
    label: string;
    file: File;
  }) => {
    if (!activeProjectId) {
      return;
    }

    const previewId = createId("media");
    const previewUrl = URL.createObjectURL(media.file);
    const previewType = media.file.type.startsWith("video/") ? "video" : "image";

    updateProject(activeProjectId, (project) => ({
      ...project,
      taskMedia: [
        {
          id: previewId,
          taskId: media.taskId,
          type: previewType,
          variant: media.variant,
          url: previewUrl,
          label: media.label,
          comments: [],
          createdAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        },
        ...project.taskMedia,
      ],
    }));

    try {
      const token = window.localStorage.getItem("slpm:token");
      if (!token || !API_BASE) {
        return;
      }

      const formData = new FormData();
      formData.append("file", media.file);
      formData.append("variant", media.variant);
      formData.append("label", media.label);

      const response = await fetch(
        `${API_BASE}/projects/${activeProjectId}/tasks/${media.taskId}/media/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const payload = await response.json();
      if (response.ok && payload.success && payload.data) {
        const mapped = mapMediaFromApi(payload.data);
        updateProject(activeProjectId, (project) => ({
          ...project,
          taskMedia: [mapped, ...project.taskMedia.filter((item) => item.id !== previewId)],
        }));
      } else {
        console.error("Failed to upload media:", payload?.message || response.statusText);
      }
    } catch (error) {
      console.error("Failed to upload media:", error);
    }
  }, [API_BASE, activeProjectId, updateProject]);

  const addTaskMediaComment = React.useCallback(
    async (
      taskId: string,
      mediaId: string,
      comment: Omit<TaskMediaComment, "id" | "createdAt">
    ) => {
      if (!activeProjectId) {
        return;
      }

      const optimisticId = createId("media-comment");
      updateProject(activeProjectId, (project) => ({
        ...project,
        taskMedia: project.taskMedia.map((item) =>
          item.id === mediaId
            ? {
                ...item,
                comments: [
                  {
                    id: optimisticId,
                    author: comment.author,
                    message: comment.message,
                    createdAt: new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                  },
                  ...(item.comments ?? []),
                ],
              }
            : item
        ),
      }));

      try {
        const token = window.localStorage.getItem("slpm:token");
        if (!token || !API_BASE) {
          return;
        }

        const response = await fetch(
          `${API_BASE}/projects/${activeProjectId}/tasks/${taskId}/media/${mediaId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: comment.message }),
          }
        );

        const payload = await response.json();
        if (response.ok && payload.success && payload.data) {
          const mapped = mapMediaFromApi(payload.data);
          updateProject(activeProjectId, (project) => ({
            ...project,
            taskMedia: project.taskMedia.map((item) => (item.id === mediaId ? mapped : item)),
          }));
          return;
        }

        updateProject(activeProjectId, (project) => ({
          ...project,
          taskMedia: project.taskMedia.map((item) =>
            item.id === mediaId
              ? {
                  ...item,
                  comments: (item.comments ?? []).filter((existing) => existing.id !== optimisticId),
                }
              : item
          ),
        }));
        console.error("Failed to add media comment:", payload?.message || response.statusText);
      } catch (error) {
        updateProject(activeProjectId, (project) => ({
          ...project,
          taskMedia: project.taskMedia.map((item) =>
            item.id === mediaId
              ? {
                  ...item,
                  comments: (item.comments ?? []).filter((existing) => existing.id !== optimisticId),
                }
              : item
          ),
        }));
        console.error("Failed to add media comment:", error);
      }
    },
    [API_BASE, activeProjectId, updateProject]
  );

  // For member role, filter projects to only those they are assigned to
  const visibleProjects = React.useMemo(() => {
    if (role !== "member" || !memberName) {
      return projects;
    }
    return projects.filter((project) =>
      project.contacts.some(
        (contact) => contact.team === "Starlink Team" && contact.name === memberName
      )
    );
  }, [projects, role, memberName]);

  const visibleActiveProject = React.useMemo(() => {
    if (role !== "member") {
      return activeProject;
    }
    return visibleProjects.find((p) => p.id === activeProjectId) ?? visibleProjects[0] ?? null;
  }, [role, visibleProjects, activeProject, activeProjectId]);

  const visibleTasks = visibleActiveProject?.tasks ?? [];
  const visibleContacts = visibleActiveProject?.contacts ?? [];
  const visibleTaskMedia = visibleActiveProject?.taskMedia ?? [];

  const value = React.useMemo<AppContextValue>(
    () => ({
      user,
      role,
      setUser,
      authAccounts,
      projects: role === "member" ? visibleProjects : projects,
      activeProjectId: role === "member" ? (visibleActiveProject?.id ?? "") : activeProjectId,
      setActiveProjectId,
      project: role === "member" ? visibleActiveProject : activeProject,
      tasks: role === "member" ? visibleTasks : tasks,
      contacts: role === "member" ? visibleContacts : contacts,
      starlinkMembers,
      taskMedia: role === "member" ? visibleTaskMedia : taskMedia,
      clientAccounts,
      addProject,
      addClientAccount,
      addStarlinkMember,
      updateAuthAccountDetails,
      updateAuthAccountPassword,
      updateClientAccountDetails,
      updateStarlinkMemberDetails,
      updateClientAccountPassword,
      updateStarlinkMemberPassword,
      removeClientAccount,
      removeStarlinkMember,
      addTask,
      updateTaskStatus,
      updateTimelineStatus,
      addComment,
      addContact,
      addTaskMedia,
      addTaskMediaComment,
      addProjectMember,
      removeProjectMember,
      updateProjectDetails,
      canEdit,
      canComment,
      canUpload,
      canMarkDone,
      memberName,
    }),
    [
      user,
      role,
      authAccounts,
      projects,
      visibleProjects,
      activeProjectId,
      setActiveProjectId,
      activeProject,
      visibleActiveProject,
      tasks,
      visibleTasks,
      contacts,
      visibleContacts,
      starlinkMembers,
      taskMedia,
      visibleTaskMedia,
      clientAccounts,
      addProject,
      addClientAccount,
      addStarlinkMember,
      updateAuthAccountDetails,
      updateAuthAccountPassword,
      updateClientAccountDetails,
      updateStarlinkMemberDetails,
      updateClientAccountPassword,
      updateStarlinkMemberPassword,
      removeClientAccount,
      removeStarlinkMember,
      addTask,
      updateTaskStatus,
      updateTimelineStatus,
      addComment,
      addContact,
      addTaskMedia,
      addProjectMember,
      removeProjectMember,
      updateProjectDetails,
      canEdit,
      canComment,
      canUpload,
      canMarkDone,
      memberName,
    ]
  );

  if (pathname !== "/login" && !user && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading your workspace...
      </div>
    );
  }

  if (pathname !== "/login" && !user && authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-sm text-muted-foreground">
        <p>{authError}</p>
        <button
          type="button"
          className="rounded-md border border-border bg-card px-4 py-2 text-foreground hover:bg-secondary/80"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (pathname !== "/login" && !user && authChecked && !authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center text-sm text-muted-foreground">
        <p>Redirecting to sign in…</p>
        <p className="max-w-sm text-xs">
          If nothing happens, open <span className="text-foreground">/login</span> or clear site data for this host and
          reload.
        </p>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
