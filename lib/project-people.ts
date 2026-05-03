import type { ClientAccount, Contact, Project } from "@/lib/types";

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

  projects.forEach((project) => {
    const summary = project.summary;
    const projectContact = project.contacts.find((contact) => contact.team === "Client Team");

    if (!projectContact) {
      return;
    }

    accountsByEmail.set(projectContact.email, {
      ...projectContact,
      password: project.clientAccess.password,
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
