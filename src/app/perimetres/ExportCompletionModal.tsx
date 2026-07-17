"use client";

import { useState } from "react";
import { Modal, Checkbox } from "@mantine/core";
import { IconFileSpreadsheet, IconDownload } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAuth } from "~/contexts/AuthContext";

interface PerimeterOption {
  id: string;
  title: string;
  color: string;
  promoCount: number;
}

interface ExportCompletionModalProps {
  opened: boolean;
  onClose: () => void;
  perimeters: PerimeterOption[];
}

export function ExportCompletionModal({
  opened,
  onClose,
  perimeters,
}: ExportCompletionModalProps) {
  const { token } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [includePromoSheets, setIncludePromoSheets] = useState(true);
  const [exporting, setExporting] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === perimeters.length
        ? new Set()
        : new Set(perimeters.map((p) => p.id)),
    );
  };

  const selectedPerimeters = perimeters.filter((p) => selected.has(p.id));
  const selectedPromoCount = selectedPerimeters.reduce(
    (sum, p) => sum + p.promoCount,
    0,
  );
  const estimatedSheetCount = 1 + (includePromoSheets ? selectedPromoCount : 0);

  const handleExport = async () => {
    if (selected.size === 0) {
      notifications.show({
        message: "Sélectionnez au moins un périmètre.",
        color: "orange",
      });
      return;
    }

    setExporting(true);
    try {
      const res = await fetch("/api/perimeters/export-completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          perimeterIds: Array.from(selected),
          includePromoSheets,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        notifications.show({
          title: "Erreur",
          message: data?.error ?? "Échec de l'export.",
          color: "red",
        });
        return;
      }

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] ?? "Export_YBoard_Completion.xlsx";

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      notifications.show({
        message: "Export généré avec succès.",
        color: "green",
      });
      onClose();
      setSelected(new Set());
    } catch {
      notifications.show({
        title: "Erreur",
        message: "Erreur réseau pendant l'export.",
        color: "red",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      radius="lg"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
      classNames={{ content: "!bg-white/85 !backdrop-blur-2xl", body: "p-0" }}
    >
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="bg-brand-100 text-brand-600 flex h-8 w-8 items-center justify-center rounded-lg">
              <IconFileSpreadsheet size={16} />
            </span>
            Exporter la complétion
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Sélectionnez un ou plusieurs périmètres. Le fichier Excel généré
          contiendra une vue d&apos;ensemble des statistiques de complétion, et
          optionnellement une feuille détaillée par promotion.
        </p>

        {perimeters.length === 0 ? (
          <div className="glass-panel rounded-lg p-4 text-sm text-gray-400">
            Aucun périmètre disponible.
          </div>
        ) : (
          <>
            <button
              onClick={toggleAll}
              className="text-brand-600 hover:text-brand-700 mb-2 text-xs font-medium"
            >
              {selected.size === perimeters.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </button>
            <div className="max-h-72 space-y-1 overflow-auto rounded-lg border border-gray-100 p-2">
              {perimeters.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    color="teal"
                  />
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate text-gray-800">{p.title}</span>
                </label>
              ))}
            </div>
          </>
        )}

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-3">
          <Checkbox
            checked={includePromoSheets}
            onChange={(e) => setIncludePromoSheets(e.currentTarget.checked)}
            color="teal"
            className="mt-0.5"
          />
          <span>
            <span className="block text-sm font-medium text-gray-800">
              Inclure le détail par promotion
            </span>
            <span className="block text-xs text-gray-500">
              Ajoute une feuille par promo (modules, intervenants, coûts).
              Décochez pour un export rapide, réduit à la vue d&apos;ensemble
              uniquement - recommandé au-delà de quelques périmètres.
            </span>
          </span>
        </label>

        {selected.size > 0 && (
          <p
            className={`mt-3 text-xs font-medium ${
              estimatedSheetCount > 50 ? "text-orange-600" : "text-gray-500"
            }`}
          >
            Estimation : {estimatedSheetCount} feuille
            {estimatedSheetCount > 1 ? "s" : ""} au total (1 vue d&apos;ensemble
            {includePromoSheets ? ` + ${selectedPromoCount} promo(s)` : ""})
            {estimatedSheetCount > 50 && " - export potentiellement lourd."}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 justify-center"
          >
            Annuler
          </button>
          <button
            onClick={() => void handleExport()}
            disabled={exporting || selected.size === 0}
            className="btn-primary flex-1 justify-center disabled:cursor-not-allowed"
          >
            <IconDownload size={16} />
            {exporting ? "Génération..." : "Exporter"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
