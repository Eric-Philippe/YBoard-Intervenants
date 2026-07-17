"use client";

import { useState } from "react";
import { LuGraduationCap, LuUser, LuUserCheck } from "react-icons/lu";

interface RelationPerson {
  teacher: { firstname: string; lastname: string };
}

interface RelationsHoverPreviewProps {
  ongoing?: RelationPerson[];
  potential?: RelationPerson[];
  selected?: RelationPerson[];
  children: React.ReactNode;
  className?: string;
}

export function RelationsHoverPreview({
  ongoing = [],
  potential = [],
  selected = [],
  children,
  className = "inline-block",
}: RelationsHoverPreviewProps) {
  const [open, setOpen] = useState(false);
  const total = ongoing.length + potential.length + selected.length;

  if (total === 0) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <div className="absolute top-full left-1/2 z-20 mt-2 w-64 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-lg">
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-t border-l border-gray-200 bg-white" />
          <div className="space-y-2">
            <RelationGroup
              label="Ongoing"
              icon={<LuGraduationCap className="h-3.5 w-3.5" />}
              color="text-green-700"
              people={ongoing}
            />
            <RelationGroup
              label="Potential"
              icon={<LuUser className="h-3.5 w-3.5" />}
              color="text-orange-700"
              people={potential}
            />
            <RelationGroup
              label="Selected"
              icon={<LuUserCheck className="h-3.5 w-3.5" />}
              color="text-purple-700"
              people={selected}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RelationGroup({
  label,
  icon,
  color,
  people,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  people: RelationPerson[];
}) {
  if (people.length === 0) return null;

  return (
    <div>
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
        {icon}
        <span>
          {label} ({people.length})
        </span>
      </div>
      <ul className="mt-1 space-y-0.5 pl-5 text-xs text-gray-600">
        {people.map((p, i) => (
          <li key={i}>
            {p.teacher.firstname} {p.teacher.lastname}
          </li>
        ))}
      </ul>
    </div>
  );
}
