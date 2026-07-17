import type { Teacher } from "~/types";
import { formatTeacherName, formatRate, getStatusLabel } from "../utils";
import { IconFileText } from "@tabler/icons-react";

interface PersonalInformationProps {
  teacher: Teacher;
}

export function PersonalInformation({ teacher }: PersonalInformationProps) {
  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
        <IconFileText size={20} />
        Informations personnelles
      </h2>
      <dl className="space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formatTeacherName(teacher)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Statut</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {getStatusLabel(teacher.status)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Diplôme</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {teacher.diploma ?? "Non spécifié"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Tarif horaire</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formatRate(teacher.rate)}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Email personnel</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {teacher.email_perso ? (
              <a
                href={`mailto:${teacher.email_perso}`}
                className="text-brand-600 hover:text-brand-800"
              >
                {teacher.email_perso}
              </a>
            ) : (
              "Non spécifié"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Email Ynov</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {teacher.email_ynov ? (
              <a
                href={`mailto:${teacher.email_ynov}`}
                className="text-brand-600 hover:text-brand-800"
              >
                {teacher.email_ynov}
              </a>
            ) : (
              "Non spécifié"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">
            Numéro de téléphone
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {teacher.phone_number ? (
              <a
                href={`tel:${teacher.phone_number}`}
                className="text-brand-600 hover:text-brand-800"
              >
                {teacher.phone_number}
              </a>
            ) : (
              "Non spécifié"
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
