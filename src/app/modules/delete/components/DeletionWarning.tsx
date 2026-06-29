import { LuTriangleAlert } from "react-icons/lu";

export function DeletionWarning() {
  return (
    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <LuTriangleAlert className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Attention - Zone de suppression
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              La suppression d&apos;un module est <strong>irréversible</strong>{" "}
              et supprimera automatiquement :
            </p>
            <ul className="mt-1 list-inside list-disc">
              <li>Toutes les associations avec les promos (PromoModules)</li>
              <li>
                Toutes les relations avec les enseignants (ongoing, potential,
                selected)
              </li>
              <li>
                Toutes les données liées à ce module dans la base de données
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
