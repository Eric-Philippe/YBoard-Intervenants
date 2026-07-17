import type { Teacher } from "../types";
import { getRelationsCount, getStatusBadgeColor, getStatusLabel } from "../utils";
import {
  IconUser,
  IconSchool,
  IconMail,
  IconPhone,
  IconTrash,
  IconFileText,
  IconBook,
} from "@tabler/icons-react";

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
    <div className="glass-card surface-hover p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <IconUser size={18} />
              {teacher.lastname} {teacher.firstname}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(teacher.status)}`}
            >
              {getStatusLabel(teacher.status)}
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
            {teacher.diploma && (
              <div className="flex items-center gap-1">
                <IconSchool size={14} />
                {teacher.diploma}
              </div>
            )}
            {teacher.email_perso && (
              <div className="flex items-center gap-1">
                <IconMail size={14} />
                {teacher.email_perso}
              </div>
            )}
            {teacher.phone_number && (
              <div className="flex items-center gap-1">
                <IconPhone size={14} />
                {teacher.phone_number}
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">ID: {teacher.id}</p>
        </div>

        <div className="flex space-x-2">
          <button onClick={onToggleDetails} className="btn-glass">
            {showDetails ? "Masquer" : "Détails"}
          </button>
          <button onClick={onDeleteClick} className="btn-danger" disabled={loading}>
            <IconTrash size={16} />
            Supprimer
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
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <IconFileText size={16} />
              Informations personnelles
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Nom complet:</strong> {teacher.lastname}{" "}
                  {teacher.firstname}
                </div>
                <div>
                  <strong>Statut:</strong> {getStatusLabel(teacher.status)}
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
                        <span className="flex items-center gap-1">
                          <IconBook size={12} />
                          {rel.promoModules.module.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconSchool size={12} />
                          {rel.promoModules.promo.level}{" "}
                          {rel.promoModules.promo.specialty}
                        </span>
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
                        <span className="flex items-center gap-1">
                          <IconBook size={12} />
                          {rel.promoModules.module.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconSchool size={12} />
                          {rel.promoModules.promo.level}{" "}
                          {rel.promoModules.promo.specialty}
                        </span>
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
                        <span className="flex items-center gap-1">
                          <IconBook size={12} />
                          {rel.promoModules.module.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconSchool size={12} />
                          {rel.promoModules.promo.level}{" "}
                          {rel.promoModules.promo.specialty}
                        </span>
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
