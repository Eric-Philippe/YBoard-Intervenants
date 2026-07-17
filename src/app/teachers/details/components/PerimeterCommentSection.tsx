"use client";

import { useEffect, useState } from "react";
import { IconMessageCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { api } from "~/trpc/react";

export function PerimeterCommentSection({ teacherId }: { teacherId: string }) {
  const utils = api.useUtils();
  const { data: mine } = api.perimeters.getMine.useQuery();
  const activePerimeter = mine?.perimeters.find(
    (p) => p.id === mine.activePerimeterId,
  );

  const { data: existing } = api.teachers.getComment.useQuery(
    { teacherId, perimeterId: activePerimeter?.id ?? "" },
    { enabled: !!activePerimeter },
  );

  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(existing?.comment ?? "");
  }, [existing?.comment]);

  const upsert = api.teachers.upsertComment.useMutation({
    onSuccess: async () => {
      if (activePerimeter) {
        await utils.teachers.getComment.invalidate({
          teacherId,
          perimeterId: activePerimeter.id,
        });
      }
      notifications.show({ message: "Commentaire enregistre", color: "green" });
    },
    onError: (error) => {
      notifications.show({
        message: `Erreur : ${error.message}`,
        color: "red",
      });
    },
  });

  if (!activePerimeter) return null;

  return (
    <div className="glass-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <IconMessageCircle size={18} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Commentaire ({activePerimeter.title})
        </h3>
      </div>
      <p className="mb-3 text-xs text-gray-500">
        Ce commentaire n&apos;est visible que dans le périmètre actif. Chaque
        périmètre a le sien.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        className="input-glass"
        placeholder="Ajouter un commentaire propre a ce périmètre..."
      />
      <button
        onClick={() =>
          upsert.mutate({
            teacherId,
            perimeterId: activePerimeter.id,
            comment: value,
          })
        }
        disabled={upsert.isPending}
        className="btn-primary mt-3"
      >
        <IconDeviceFloppy size={16} />
        {upsert.isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}
