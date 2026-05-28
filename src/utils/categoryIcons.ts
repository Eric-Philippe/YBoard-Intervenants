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
} from "react-icons/fa";

export const SPEC_ICONS: Record<string, { Icon: IconType; color: string }> = {
  null:                { Icon: FaGraduationCap, color: "#2563eb" },
  informatique:        { Icon: FaCode,          color: "#2563eb" },
  ia_data:             { Icon: FaChartLine,     color: "#16a34a" },
  developpement:       { Icon: FaCodeBranch,    color: "#7c3aed" },
  dev_fullstack:       { Icon: FaLayerGroup,    color: "#4338ca" },
  dev_mobile_iot:      { Icon: FaMobileAlt,     color: "#ea580c" },
  integration_ia_dev:  { Icon: FaRobot,         color: "#0d9488" },
  expert_ia:           { Icon: FaBrain,         color: "#059669" },
  data_engineer:       { Icon: FaDatabase,      color: "#0891b2" },
  systemes_embarques:  { Icon: FaMicrochip,     color: "#d97706" },
};

export type SurveyCategoryForIcon = { specialization?: string | null };

export function getCatIcon(cat: SurveyCategoryForIcon) {
  const key = cat?.specialization ?? "null";
  return SPEC_ICONS[key] ?? SPEC_ICONS.null!;
}
