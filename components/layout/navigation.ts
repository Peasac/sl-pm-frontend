import { CheckSquare, Compass, FolderPlus, Image, UsersRound } from "lucide-react";

export const portalNavItems = [
  { label: "Overview", href: "/overview", icon: Compass },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Photos", href: "/photos", icon: Image },
];

export const adminNavItems = [
  { label: "Add Project", href: "/projects/new", icon: FolderPlus },
  { label: "Members&Client", href: "/members-client", icon: UsersRound },
];
