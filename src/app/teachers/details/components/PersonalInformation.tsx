import type { Teacher } from "~/types";
import { formatTeacherName, formatRate } from "../utils";

interface PersonalInformationProps {
  teacher: Teacher;
}

export function PersonalInformation({ teacher }: PersonalInformationProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        📋 Informations personnelles
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
            {teacher.status ?? "Non spécifié"}
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
                className="text-blue-600 hover:text-blue-800"
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
                className="text-blue-600 hover:text-blue-800"
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
                className="text-blue-600 hover:text-blue-800"
              >
                {teacher.phone_number}
              </a>
            ) : (
              "Non spécifié"
            )}
          </dd>
        </div>
        {teacher.comments && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Commentaires</dt>
            <dd className="mt-1 text-sm text-gray-900">{teacher.comments}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
