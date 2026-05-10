import type { ClientAccount, Contact, Project, ProjectClientAccess } from "@/lib/types";

/** Older persisted projects stored one client object; runtime code expects an array. */
export function normalizeProjectClientAccess(project: Project): Project {
  const raw = project.clientAccess as unknown;
  if (Array.isArray(raw)) {
    return project;
  }
  if (raw && typeof raw === "object" && raw !== null && "email" in raw) {
    const c = raw as ProjectClientAccess;
    return {
      ...project,
      clientAccess: [
        {
          name: c.name ?? "",
          email: c.email ?? "",
          password: c.password ?? "",
        },
      ],
    };
  }
  return { ...project, clientAccess: [] };
}

export const defaultStarlinkMembers: Contact[] = [
  {
    id: "starlink-1",
    name: "Elena Pierce",
    role: "Program Director",
    email: "elena.pierce@starlink.com",
    team: "Starlink Team",
    avatar: "EP",
  },
  {
    id: "starlink-2",
    name: "Rina Patel",
    role: "Field Ops Lead",
    email: "rina.patel@starlink.com",
    team: "Starlink Team",
    avatar: "RP",
  },
  {
    id: "starlink-3",
    name: "Jae Kim",
    role: "Network Engineering",
    email: "jae.kim@starlink.com",
    team: "Starlink Team",
    avatar: "JK",
  },
  {
    id: "starlink-4",
    name: "Maya Chen",
    role: "Security Operations",
    email: "maya.chen@starlink.com",
    team: "Starlink Team",
    avatar: "MC",
  },
];

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "SL";

export const getClientAccountsFromProjects = (projects: Project[]) => {
  const accountsByEmail = new Map<string, ClientAccount>();

  projects.forEach((raw) => {
    const project = normalizeProjectClientAccess(raw);
    const summary = project.summary;
    const projectContact = project.contacts.find((contact) => contact.team === "Client Team");

    if (!projectContact) {
      return;
    }

    const clientAccessEntry = project.clientAccess.find(
      (entry) => entry.email.toLowerCase() === projectContact.email.toLowerCase()
    );

    accountsByEmail.set(projectContact.email, {
      ...projectContact,
      password: clientAccessEntry?.password ?? "",
      sourceProjectId: project.id,
      avatar: projectContact.avatar || getInitials(summary.client),
    });
  });

  return Array.from(accountsByEmail.values());
};

export const getStarlinkMembersFromProjects = (projects: Project[]) => {
  const membersByEmail = new Map<string, Contact>();

  projects.forEach((project) => {
    project.contacts
      .filter((contact) => contact.team === "Starlink Team")
      .forEach((contact) => {
        membersByEmail.set(contact.email, contact);
      });
  });

  return Array.from(membersByEmail.values());
};
