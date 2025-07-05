import type { Teacher } from "~/types";
import { getRelationSections } from "../utils";
import { RelationsSection } from "./RelationsSection";

interface RelationsGridProps {
  teacher: Teacher;
}

export function RelationsGrid({ teacher }: RelationsGridProps) {
  const relationSections = getRelationSections(teacher);

  return (
    <div className="lg:col-span-2">
      <div className="space-y-6">
        {relationSections.map((section) => (
          <RelationsSection key={section.type} section={section} />
        ))}
      </div>
    </div>
  );
}
