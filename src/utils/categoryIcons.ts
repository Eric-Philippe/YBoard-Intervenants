import type { IconType } from "react-icons";
import {
  FaGraduationCap,
  FaCode,
  FaChartLine,
  FaCodeBranch,
  FaLayerGroup,
  FaMobileAlt,
  FaRobot,
  FaBrain,
  FaDatabase,
  FaMicrochip,
  FaShieldAlt,
  FaNetworkWired,
  FaPalette,
  FaBriefcase,
  FaCloud,
  FaCubes,
} from "react-icons/fa";

export const SPEC_ICONS: Record<
  string,
  { Icon: IconType; color: string; label: string }
> = {
  default: { Icon: FaGraduationCap, color: "#2563eb", label: "Generique" },
  informatique: { Icon: FaCode, color: "#2563eb", label: "Informatique" },
  ia_data: { Icon: FaChartLine, color: "#16a34a", label: "IA & Data" },
  developpement: {
    Icon: FaCodeBranch,
    color: "#7c3aed",
    label: "Developpement",
  },
  dev_fullstack: {
    Icon: FaLayerGroup,
    color: "#4338ca",
    label: "Dev Fullstack",
  },
  dev_mobile_iot: {
    Icon: FaMobileAlt,
    color: "#ea580c",
    label: "Mobile & IoT",
  },
  integration_ia_dev: {
    Icon: FaRobot,
    color: "#0d9488",
    label: "Integration IA",
  },
  expert_ia: { Icon: FaBrain, color: "#059669", label: "Expert IA" },
  data_engineer: {
    Icon: FaDatabase,
    color: "#0891b2",
    label: "Data Engineering",
  },
  systemes_embarques: {
    Icon: FaMicrochip,
    color: "#d97706",
    label: "Systemes Embarques",
  },
  cybersecurite: {
    Icon: FaShieldAlt,
    color: "#dc2626",
    label: "Cybersecurite",
  },
  reseaux: { Icon: FaNetworkWired, color: "#0284c7", label: "Reseaux" },
  design: { Icon: FaPalette, color: "#db2777", label: "Design" },
  gestion: {
    Icon: FaBriefcase,
    color: "#78716c",
    label: "Gestion & Management",
  },
  cloud: { Icon: FaCloud, color: "#0ea5e9", label: "Cloud" },
  architecture: {
    Icon: FaCubes,
    color: "#6d28d9",
    label: "Architecture logicielle",
  },
};

export const ICON_OPTIONS = Object.entries(SPEC_ICONS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export type SurveyCategoryForIcon = {
  icon?: string | null;
  specialization?: string | null;
};

export function getCatIcon(cat: SurveyCategoryForIcon) {
  // Prefer the explicit icon chosen on the promo
  const key = cat?.icon ?? cat?.specialization ?? "default";
  return SPEC_ICONS[key] ?? SPEC_ICONS.default!;
}
