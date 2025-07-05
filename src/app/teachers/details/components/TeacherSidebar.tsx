import type { Teacher } from "~/types";
import type { TeacherStatistics } from "../types";
import { PersonalInformation } from "./PersonalInformation";
import { StatisticsCard } from "./StatisticsCard";

interface TeacherSidebarProps {
  teacher: Teacher;
  statistics: TeacherStatistics;
}

export function TeacherSidebar({ teacher, statistics }: TeacherSidebarProps) {
  return (
    <div className="lg:col-span-1">
      <PersonalInformation teacher={teacher} />
      <StatisticsCard statistics={statistics} />
    </div>
  );
}
