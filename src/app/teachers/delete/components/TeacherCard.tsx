import type { Teacher } from "../types";
import { getRelationsCount, getStatusBadgeColor } from "../utils";

interface TeacherCardProps {
  teacher: Teacher;
  showDetails: boolean;
  loading: boolean;
  onToggleDetails: () => void;
  onDeleteClick: () => void;
}

export default function TeacherCard({
  teacher,
  showDetails,
  loading,
  onToggleDetails,
  onDeleteClick,
}: TeacherCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              👨‍🏫 {teacher.lastname} {teacher.firstname}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(teacher.status)}`}
            >
              {teacher.status ?? "Non spécifié"}
            </span>
            {teacher.rate && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {Number(teacher.rate)}€/h
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
              {getRelationsCount(teacher)} relation(s)
            </span>
          </div>
          <div className="mt-2 flex space-x-4 text-sm text-gray-500">
            {teacher.diploma && <div>🎓 {teacher.diploma}</div>}
            {teacher.email_perso && <div>📧 {teacher.email_perso}</div>}
            {teacher.phone_number && <div>📞 {teacher.phone_number}</div>}
          </div>
          <p className="mt-1 text-sm text-gray-500">ID: {teacher.id}</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onToggleDetails}
            className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
          >
            {showDetails ? "Masquer" : "Détails"}
          </button>
          <button
            onClick={onDeleteClick}
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>

      {/* Details section */}
      {showDetails && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-md mb-3 font-semibold text-gray-800">
            Données qui seront supprimées :
          </h4>

          {/* Personal Information */}
          <div className="mb-4 rounded-md bg-gray-50 p-3">
            <div className="font-medium text-gray-900">
              📋 Informations personnelles
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Nom complet:</strong> {teacher.lastname}{" "}
                  {teacher.firstname}
                </div>
                <div>
                  <strong>Statut:</strong> {teacher.status ?? "Non spécifié"}
                </div>
                <div>
                  <strong>Diplôme:</strong> {teacher.diploma ?? "Non spécifié"}
                </div>
                <div>
                  <strong>Tarif:</strong>{" "}
                  {teacher.rate ? `${Number(teacher.rate)}€/h` : "Non spécifié"}
                </div>
                <div>
                  <strong>Email personnel:</strong>{" "}
                  {teacher.email_perso ?? "Non spécifié"}
                </div>
                <div>
                  <strong>Email Ynov:</strong>{" "}
                  {teacher.email_ynov ?? "Non spécifié"}
                </div>
                <div>
                  <strong>Téléphone:</strong>{" "}
                  {teacher.phone_number ?? "Non spécifié"}
                </div>
              </div>
              {teacher.comments && (
                <div className="mt-2">
                  <strong>Commentaires:</strong> {teacher.comments}
                </div>
              )}
            </div>
          </div>

          {/* Relations */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-md bg-green-50 p-3">
                <span className="font-medium text-green-900">Ongoing:</span>
                <div className="mt-1">
                  {teacher.ongoing?.length ? (
                    teacher.ongoing.map((rel, idx) => (
                      <div key={idx} className="text-xs text-green-700">
                        📚 {rel.promoModules.module.name}
                        <br />
                        🎓 {rel.promoModules.promo.level}{" "}
                        {rel.promoModules.promo.specialty}
                      </div>
                    ))
                  ) : (
                    <span className="text-green-500">Aucune</span>
                  )}
                </div>
              </div>
              <div className="rounded-md bg-orange-50 p-3">
                <span className="font-medium text-orange-900">Potential:</span>
                <div className="mt-1">
                  {teacher.potential?.length ? (
                    teacher.potential.map((rel, idx) => (
                      <div key={idx} className="text-xs text-orange-700">
                        📚 {rel.promoModules.module.name}
                        <br />
                        🎓 {rel.promoModules.promo.level}{" "}
                        {rel.promoModules.promo.specialty}
                      </div>
                    ))
                  ) : (
                    <span className="text-orange-500">Aucune</span>
                  )}
                </div>
              </div>
              <div className="rounded-md bg-blue-50 p-3">
                <span className="font-medium text-blue-900">Selected:</span>
                <div className="mt-1">
                  {teacher.selected?.length ? (
                    teacher.selected.map((rel, idx) => (
                      <div key={idx} className="text-xs text-blue-700">
                        📚 {rel.promoModules.module.name}
                        <br />
                        🎓 {rel.promoModules.promo.level}{" "}
                        {rel.promoModules.promo.specialty}
                      </div>
                    ))
                  ) : (
                    <span className="text-blue-500">Aucune</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
