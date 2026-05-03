"use client";

import * as React from "react";
import type {
  Contact,
  ClientAccount,
  CreateProjectInput,
  Project,
  Role,
  Task,
  TaskComment,
  TaskMediaItem,
  TaskStatus,
  TimelineStatus,
  User,
} from "@/lib/types";
import {
  defaultStarlinkMembers,
  getClientAccountsFromProjects,
  getStarlinkMembersFromProjects,
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
  addProject: (project: CreateProjectInput) => string;
  addClientAccount: (account: Omit<ClientAccount, "id">) => void;
  addStarlinkMember: (member: Omit<Contact, "id">) => void;
  updateAuthAccountDetails: (
    currentEmail: string,
    details: Pick<User, "name" | "email" | "role">
  ) => void;
  updateAuthAccountPassword: (email: string, password: string) => void;
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
  addTaskMedia: (media: Omit<TaskMediaItem, "id" | "createdAt">) => void;
  addProjectMember: (memberId: string) => void;
  removeProjectMember: (memberId: string) => void;
  canEdit: boolean;
  canComment: boolean;
  canUpload: boolean;
  canMarkDone: boolean;
  memberName: string | null;
};

const AppContext = React.createContext<AppContextValue | undefined>(undefined);

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [authAccounts, setAuthAccounts] = React.useState<AuthAccount[]>(defaultAuthAccounts);
  const [projects, setProjects] = React.useState<Project[]>(projectCatalog);
  const [clientAccounts, setClientAccounts] = React.useState<ClientAccount[]>(
    getClientAccountsFromProjects(projectCatalog)
  );
  const [starlinkMembers, setStarlinkMembers] = React.useState<Contact[]>(defaultStarlinkMembers);
  const [deletedClientEmails, setDeletedClientEmails] = React.useState<string[]>([]);
  const [deletedStarlinkEmails, setDeletedStarlinkEmails] = React.useState<string[]>([]);
  const [activeProjectId, setActiveProjectId] = React.useState<string>(
    projectCatalog[0]?.id ?? ""
  );

  React.useEffect(() => {
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
          parsedProjects = parsed;
          setProjects(parsed);
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
  const canComment = true;
  const canUpload = role === "admin" || role === "member";
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

  const addProject = React.useCallback((project: CreateProjectInput) => {
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

    const clientAccess =
      project.client.mode === "existing"
        ? clientAccounts.find((account) => account.email === project.client.email) ?? null
        : null;

    const clientName =
      project.client.mode === "existing"
        ? clientAccess?.name ?? project.client.email.split("@")[0] ?? "Client"
        : project.client.name;
    const clientEmail =
      project.client.mode === "existing" ? project.client.email : project.client.email;
    const clientPassword =
      project.client.mode === "existing"
        ? clientAccess?.password ?? ""
        : project.client.password;

    const contacts: Contact[] = [
      {
        id: createId("contact"),
        name: clientName,
        role: "Client Contact",
        email: clientEmail,
        team: "Client Team",
        avatar: getInitials(clientName),
      },
      ...project.members.map((member) => ({
        ...member,
        id: createId("contact"),
      })),
    ];

    if (project.client.mode === "new") {
      setClientAccounts((previousClients) => [
        {
          id: createId("client"),
          name: clientName,
          role: "Client Contact",
          email: clientEmail,
          team: "Client Team",
          avatar: getInitials(clientName),
          password: clientPassword,
          sourceProjectId: projectId,
        },
        ...previousClients.filter((account) => account.email !== clientEmail),
      ]);
    }

    const nextProject: Project = {
      id: projectId,
      name: project.name,
      clientAccess: {
        name: clientName,
        email: clientEmail,
        password: clientPassword,
      },
      summary: {
        name: project.name,
        client: clientName,
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

    return projectId;
  }, [clientAccounts]);

  const addClientAccount = React.useCallback((account: Omit<ClientAccount, "id">) => {
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
  }, []);

  const addStarlinkMember = React.useCallback((member: Omit<Contact, "id">) => {
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
  }, []);

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
    },
    []
  );

  const updateAuthAccountPassword = React.useCallback((email: string, password: string) => {
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
  }, []);

  const updateClientAccountDetails = React.useCallback(
    (currentEmail: string, details: Pick<Contact, "name" | "role" | "email">) => {
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
          const shouldUpdateClient = project.clientAccess.email === currentEmail;
          const nextClientAccess = shouldUpdateClient
            ? {
                ...project.clientAccess,
                name: details.name,
                email: details.email,
              }
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
    },
    []
  );

  const updateStarlinkMemberDetails = React.useCallback(
    (currentEmail: string, details: Pick<Contact, "name" | "role" | "email">) => {
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
    },
    []
  );

  const updateClientAccountPassword = React.useCallback((email: string, password: string) => {
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
      previousProjects.map((project) =>
        project.clientAccess.email === email
          ? {
              ...project,
              clientAccess: {
                ...project.clientAccess,
                password,
              },
              contacts: project.contacts.map((contact) =>
                contact.email === email
                  ? {
                      ...contact,
                      password,
                    }
                  : contact
              ),
            }
          : project
      )
    );
  }, []);

  const updateStarlinkMemberPassword = React.useCallback((email: string, password: string) => {
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
  }, []);

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
    },
    [activeProjectId, updateProject]
  );

  const addTask = React.useCallback(
    (task: Omit<Task, "id" | "comments" | "updatedAt">) => {
      if (!activeProjectId) {
        return;
      }
      updateProject(activeProjectId, (project) => ({
        ...project,
        tasks: [
          {
            ...task,
            id: createId("task"),
            updatedAt: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            comments: [],
          },
          ...project.tasks,
        ],
      }));
    },
    [activeProjectId, updateProject]
  );

  const updateTaskStatus = React.useCallback((taskId: string, status: TaskStatus) => {
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
    }));
  }, [activeProjectId, updateProject]);

  const addComment = React.useCallback(
    (taskId: string, comment: Omit<TaskComment, "id" | "createdAt">) => {
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
    },
    [activeProjectId, updateProject]
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
  }, [activeProjectId, starlinkMembers, updateProject]);

  const removeProjectMember = React.useCallback((contactId: string) => {
    if (!activeProjectId) {
      return;
    }
    updateProject(activeProjectId, (project) => ({
      ...project,
      contacts: project.contacts.filter((c) => c.id !== contactId),
    }));
  }, [activeProjectId, updateProject]);

  const addTaskMedia = React.useCallback((media: Omit<TaskMediaItem, "id" | "createdAt">) => {
    if (!activeProjectId) {
      return;
    }
    updateProject(activeProjectId, (project) => ({
      ...project,
      taskMedia: [
        {
          ...media,
          id: createId("media"),
          createdAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        },
        ...project.taskMedia,
      ],
    }));
  }, [activeProjectId, updateProject]);

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
      addProjectMember,
      removeProjectMember,
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
      canEdit,
      canComment,
      canUpload,
      canMarkDone,
      memberName,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
