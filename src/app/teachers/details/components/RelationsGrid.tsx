import type { Teacher } from "~/types";
import { getRelationSections } from "../utils";
import { RelationsSection } from "./RelationsSection";

interface RelationsGridProps {
  teacher: Teacher;
}

export function RelationsGrid({ teacher }: RelationsGridProps) {
  const relationSections = getRelationSections(teacher);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {relationSections.map((section) => (
        <RelationsSection key={section.type} section={section} />
      ))}
    </div>
  );
}
