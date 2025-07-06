import type { RelationSection } from "../types";
import { getTotalWorkload, getTotalAmount } from "../utils";
import { RelationCard } from "./RelationCard";

interface RelationsSectionProps {
  section: RelationSection;
}

export function RelationsSection({ section }: RelationsSectionProps) {
  const { type, title, emoji, relations, colorScheme } = section;
  const totalAmount = getTotalAmount(relations);

  return (
    <div
      className={`rounded-lg border ${colorScheme.border} ${colorScheme.bg} p-6`}
    >
      <h2
        className={`mb-4 flex items-center text-xl font-semibold ${colorScheme.text}`}
      >
        <span className="mr-2">{emoji}</span>
        {title} ({relations.length})
      </h2>
      {relations.length ? (
        <div className="space-y-3">
          {relations.map((relation, index) => (
            <RelationCard
              key={index}
              relation={relation}
              colorScheme={colorScheme}
            />
          ))}
          <div className="mt-4 space-y-1 text-right">
            <div className={`text-sm font-medium ${colorScheme.totalText}`}>
              Total {type.charAt(0).toUpperCase() + type.slice(1)}:{" "}
              {getTotalWorkload(relations)}h
            </div>
            {totalAmount > 0 && (
              <div className={`text-sm font-medium ${colorScheme.totalText}`}>
                Montant total: {totalAmount.toFixed(2)}€
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className={colorScheme.text}>
          Aucune relation {type} pour le moment.
        </p>
      )}
    </div>
  );
}
