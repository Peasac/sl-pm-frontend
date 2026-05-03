import type {
  Contact,
  Project,
  ProjectSummary,
  ScopeItem,
  Task,
  TaskMediaItem,
  TimelineItem,
} from "./types";

const projectAlphaSummary: ProjectSummary = {
  name: "Starlink Expansion - XYZ Phase 2",
  client: "XYZ Energy",
  location: "Corpus Christi, TX",
  status: "In Progress",
  progress: 68,
  startDate: "Feb 12, 2026",
  targetDate: "Aug 30, 2026",
  budget: "$3.8M",
  nextMilestone: "Backhaul commissioning",
};

const projectAlphaTimeline: TimelineItem[] = [
  {
    id: "alpha-kickoff",
    title: "Program kickoff",
    date: "Feb 12, 2026",
    description: "Stakeholder alignment and scope lock.",
    status: "Completed",
  },
  {
    id: "alpha-survey",
    title: "Site survey and permitting",
    date: "Feb 26, 2026",
    description: "Survey completed for 3 locations.",
    status: "Completed",
  },
  {
    id: "alpha-civil",
    title: "Civil works phase 1",
    date: "Mar 20, 2026",
    description: "Foundations and conduit in progress.",
    status: "In Progress",
  },
  {
    id: "alpha-ground",
    title: "Ground station integration",
    date: "Apr 18, 2026",
    description: "Rack build and power redundancy.",
    status: "In Progress",
  },
  {
    id: "alpha-network-test",
    title: "Network test window",
    date: "May 15, 2026",
    description: "Cross-team validation and tuning.",
    status: "Pending",
  },
  {
    id: "alpha-readiness",
    title: "Client readiness review",
    date: "Jun 10, 2026",
    description: "Training and operational handoff.",
    status: "Pending",
  },
];

const projectAlphaScope: ScopeItem[] = [
  {
    title: "Uplink facility upgrades",
    description: "Replace legacy RF chain with Starlink standard kit.",
  },
  {
    title: "Fiber backhaul integration",
    description: "Dual carrier path with auto-failover.",
  },
  {
    title: "Power redundancy",
    description: "N+1 UPS and generator auto-start sequence.",
  },
  {
    title: "Security hardening",
    description: "Zero-trust access and segmented VLANs.",
  },
  {
    title: "Monitoring + alerting",
    description: "Unified telemetry with SLA alerts.",
  },
  {
    title: "Client enablement",
    description: "Runbook delivery and live training sessions.",
  },
];

const projectAlphaTasks: Task[] = [
  {
    id: "task-1",
    name: "Complete coastal site survey",
    category: "Field Ops",
    assignee: "Rina Patel",
    timelineStageId: "alpha-survey",
    status: "Completed",
    updatedAt: "Apr 27, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 2 },
    comments: [
      {
        id: "comment-1",
        author: "Rina Patel",
        message: "Survey done, awaiting final sign-off docs.",
        createdAt: "Apr 27, 2026",
      },
    ],
  },
  {
    id: "task-2",
    name: "Power redundancy install",
    category: "Infrastructure",
    assignee: "Luis Martinez",
    timelineStageId: "alpha-civil",
    status: "In Progress",
    updatedAt: "Apr 26, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 1 },
    comments: [
      {
        id: "comment-2",
        author: "Luis Martinez",
        message: "UPS racks are staged. Generator wiring starts tomorrow.",
        createdAt: "Apr 26, 2026",
      },
    ],
  },
  {
    id: "task-3",
    name: "Fiber backhaul procurement",
    category: "Network",
    assignee: "Jae Kim",
    timelineStageId: "alpha-ground",
    status: "Pending",
    updatedAt: "Apr 24, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 0 },
    comments: [
      {
        id: "comment-3",
        author: "Jae Kim",
        message: "Waiting on carrier LOA approvals.",
        createdAt: "Apr 24, 2026",
      },
    ],
  },
  {
    id: "task-4",
    name: "Ground station rack build",
    category: "Infrastructure",
    assignee: "Adrian Moss",
    timelineStageId: "alpha-ground",
    status: "In Progress",
    updatedAt: "Apr 23, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 1 },
    comments: [
      {
        id: "comment-4",
        author: "Adrian Moss",
        message: "Awaiting cooling clearance for rack row B.",
        createdAt: "Apr 22, 2026",
      },
    ],
  },
  {
    id: "task-5",
    name: "Security access review",
    category: "Security",
    assignee: "Maya Chen",
    timelineStageId: "alpha-readiness",
    status: "Blocked",
    updatedAt: "Apr 21, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 0 },
    comments: [
      {
        id: "comment-5",
        author: "Maya Chen",
        message: "Waiting on client badge list and escort policy.",
        createdAt: "Apr 21, 2026",
      },
    ],
  },
  {
    id: "task-6",
    name: "Commissioning readiness",
    category: "Operations",
    assignee: "Nora Wells",
    timelineStageId: "alpha-readiness",
    status: "Pending",
    updatedAt: "Apr 19, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 0 },
    comments: [
      {
        id: "comment-6",
        author: "Nora Wells",
        message: "Training schedule pending confirmation.",
        createdAt: "Apr 19, 2026",
      },
    ],
  },
];

const projectAlphaContacts: Contact[] = [
  {
    id: "contact-1",
    name: "Elena Pierce",
    role: "Program Director",
    email: "elena.pierce@starlink.com",
    team: "Starlink Team",
    avatar: "EP",
  },
  {
    id: "contact-2",
    name: "Rina Patel",
    role: "Field Ops Lead",
    email: "rina.patel@starlink.com",
    team: "Starlink Team",
    avatar: "RP",
  },
  {
    id: "contact-3",
    name: "Jae Kim",
    role: "Network Engineering",
    email: "jae.kim@starlink.com",
    team: "Starlink Team",
    avatar: "JK",
  },
  {
    id: "contact-4",
    name: "Carson Holt",
    role: "Client Operations",
    email: "carson.holt@xyz.com",
    team: "Client Team",
    avatar: "CH",
  },
  {
    id: "contact-5",
    name: "Priya Desai",
    role: "Facilities Manager",
    email: "priya.desai@xyz.com",
    team: "Client Team",
    avatar: "PD",
  },
];

const projectAlphaMedia: TaskMediaItem[] = [
  {
    id: "media-1",
    taskId: "task-2",
    type: "image",
    variant: "before",
    url:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
    label: "Trenching pre-install",
    createdAt: "Apr 20, 2026",
  },
  {
    id: "media-2",
    taskId: "task-2",
    type: "image",
    variant: "after",
    url:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    label: "Foundation poured",
    createdAt: "Apr 25, 2026",
  },
  {
    id: "media-3",
    taskId: "task-4",
    type: "image",
    variant: "before",
    url:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    label: "Rack bay prep",
    createdAt: "Apr 21, 2026",
  },
  {
    id: "media-4",
    taskId: "task-4",
    type: "image",
    variant: "after",
    url:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
    label: "Cooling rails installed",
    createdAt: "Apr 23, 2026",
  },
  {
    id: "media-5",
    taskId: "task-3",
    type: "video",
    variant: "other",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    label: "Backhaul vendor walkthrough",
    createdAt: "Apr 24, 2026",
  },
];

const projectBetaSummary: ProjectSummary = {
  name: "Starlink Coastal Resilience - ZEN Phase 1",
  client: "ZEN Maritime",
  location: "Norfolk, VA",
  status: "In Progress",
  progress: 42,
  startDate: "Mar 04, 2026",
  targetDate: "Oct 12, 2026",
  budget: "$2.1M",
  nextMilestone: "Harbor pilot integration",
};

const projectBetaTimeline: TimelineItem[] = [
  {
    id: "beta-kickoff",
    title: "Stakeholder kickoff",
    date: "Mar 04, 2026",
    description: "Resilience targets and port authority alignment.",
    status: "Completed",
  },
  {
    id: "beta-harbor-survey",
    title: "Harbor survey",
    date: "Mar 18, 2026",
    description: "Bathymetry and RF interference scan.",
    status: "Completed",
  },
  {
    id: "beta-design",
    title: "Critical path design",
    date: "Apr 08, 2026",
    description: "Network redundancy and failover design.",
    status: "In Progress",
  },
  {
    id: "beta-permits",
    title: "Maritime permits",
    date: "Apr 28, 2026",
    description: "Waiting on Coast Guard approvals.",
    status: "Pending",
  },
  {
    id: "beta-pilot",
    title: "Pilot installation",
    date: "May 18, 2026",
    description: "Prototype terminal installed for testing.",
    status: "Pending",
  },
];

const projectBetaScope: ScopeItem[] = [
  {
    title: "Harbor RF coverage",
    description: "Multi-terminal coverage for storm operations.",
  },
  {
    title: "Resilience playbooks",
    description: "Offline mode and fallback procedures.",
  },
  {
    title: "Terminal hardening",
    description: "Saltwater resistant enclosures and mounts.",
  },
  {
    title: "Port operations training",
    description: "Simulation drills with ZEN operations team.",
  },
];

const projectBetaTasks: Task[] = [
  {
    id: "beta-task-1",
    name: "Finalize RF design review",
    category: "Network",
    assignee: "Hannah Reed",
    timelineStageId: "beta-design",
    status: "In Progress",
    updatedAt: "Apr 29, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 1 },
    comments: [
      {
        id: "beta-comment-1",
        author: "Hannah Reed",
        message: "Port authority feedback requested on placement zones.",
        createdAt: "Apr 28, 2026",
      },
    ],
  },
  {
    id: "beta-task-2",
    name: "Confirm maritime permit package",
    category: "Compliance",
    assignee: "Ravi Singh",
    timelineStageId: "beta-permits",
    status: "Pending",
    updatedAt: "Apr 27, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 0 },
    comments: [
      {
        id: "beta-comment-2",
        author: "Ravi Singh",
        message: "Awaiting updated site maps from ZEN ops.",
        createdAt: "Apr 27, 2026",
      },
    ],
  },
  {
    id: "beta-task-3",
    name: "Pilot terminal staging",
    category: "Field Ops",
    assignee: "Monica Diaz",
    timelineStageId: "beta-pilot",
    status: "Pending",
    updatedAt: "Apr 25, 2026",
    pipeline: { steps: ["Plan", "Build", "Launch"], currentStep: 0 },
    comments: [
      {
        id: "beta-comment-3",
        author: "Monica Diaz",
        message: "Staging scheduled for May 3rd pending permit.",
        createdAt: "Apr 25, 2026",
      },
    ],
  },
];

const projectBetaContacts: Contact[] = [
  {
    id: "beta-contact-1",
    name: "Hannah Reed",
    role: "Network Lead",
    email: "hannah.reed@starlink.com",
    team: "Starlink Team",
    avatar: "HR",
  },
  {
    id: "beta-contact-2",
    name: "Ravi Singh",
    role: "Compliance Manager",
    email: "ravi.singh@starlink.com",
    team: "Starlink Team",
    avatar: "RS",
  },
  {
    id: "beta-contact-3",
    name: "Amelia Hart",
    role: "Port Ops Manager",
    email: "amelia.hart@zen.com",
    team: "Client Team",
    avatar: "AH",
  },
];

const projectBetaMedia: TaskMediaItem[] = [
  {
    id: "media-beta-1",
    taskId: "beta-task-1",
    type: "image",
    variant: "before",
    url:
      "https://images.unsplash.com/photo-1496309732348-3627f3f040ee?auto=format&fit=crop&w=900&q=80",
    label: "RF design draft",
    createdAt: "Apr 26, 2026",
  },
  {
    id: "media-beta-2",
    taskId: "beta-task-1",
    type: "image",
    variant: "after",
    url:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    label: "Validated site map",
    createdAt: "Apr 29, 2026",
  },
  {
    id: "media-beta-3",
    taskId: "beta-task-3",
    type: "image",
    variant: "before",
    url:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    label: "Pilot staging area",
    createdAt: "Apr 25, 2026",
  },
];

export const projectCatalog: Project[] = [
  {
    id: "alpha",
    name: "XYZ Phase 2",
    summary: projectAlphaSummary,
    clientAccess: {
      name: "Carson Holt",
      email: "carson.holt@xyz.com",
      password: "xyz-coastal-2026",
    },
    overviewStats: [
      { label: "Completed", value: 18, detail: "Milestones" },
      { label: "In Progress", value: 6, detail: "Active streams" },
      { label: "Pending", value: 4, detail: "Approvals" },
    ],
    timelineItems: projectAlphaTimeline,
    scopeItems: projectAlphaScope,
    tasks: projectAlphaTasks,
    contacts: projectAlphaContacts,
    taskMedia: projectAlphaMedia,
  },
  {
    id: "beta",
    name: "ZEN Phase 1",
    summary: projectBetaSummary,
    clientAccess: {
      name: "Amelia Hart",
      email: "amelia.hart@zen.com",
      password: "zen-maritime-2026",
    },
    overviewStats: [
      { label: "Completed", value: 6, detail: "Milestones" },
      { label: "In Progress", value: 4, detail: "Active streams" },
      { label: "Pending", value: 3, detail: "Approvals" },
    ],
    timelineItems: projectBetaTimeline,
    scopeItems: projectBetaScope,
    tasks: projectBetaTasks,
    contacts: projectBetaContacts,
    taskMedia: projectBetaMedia,
  },
];
