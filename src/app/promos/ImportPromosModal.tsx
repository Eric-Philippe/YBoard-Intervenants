"use client";

import { useRef, useState } from "react";
import { Modal } from "@mantine/core";
import {
  IconFileSpreadsheet,
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconUpload,
} from "@tabler/icons-react";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";

interface SheetReport {
  name: string;
  status: "ok" | "skipped" | "error";
  reason?: string;
  level?: string;
  specialty?: string;
  promoStatus?: "created" | "reused";
  modulesCreated: number;
  rowErrors: string[];
}

interface ImportResult {
  success: boolean;
  summary: {
    sheetsTotal: number;
    sheetsProcessed: number;
    sheetsSkipped: number;
    sheetsErrored: number;
    modulesCreated: number;
    extraSheetsIgnored: number;
  };
  sheets: SheetReport[];
}

const statusStyles: Record<SheetReport["status"], { icon: typeof IconCheck; classes: string }> = {
  ok: { icon: IconCheck, classes: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  skipped: { icon: IconInfoCircle, classes: "border-gray-200 bg-gray-50 text-gray-500" },
  error: { icon: IconAlertTriangle, classes: "border-red-200 bg-red-50 text-red-700" },
};

export function ImportPromosModal({ perimeterId }: { perimeterId: string | undefined }) {
  const { token } = useAuth();
  const utils = api.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerFilePicker = () => {
    if (!perimeterId) {
      setError("Aucun périmètre actif.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !perimeterId) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("perimeterId", perimeterId);

      const res = await fetch("/api/promos/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
        body: formData,
      });

      const data = (await res.json()) as ImportResult | { error: string };
      if (!res.ok || !("success" in data)) {
        setError("error" in data ? data.error : "Échec de l'import.");
        return;
      }

      setResult(data);
      await Promise.all([utils.promos.invalidate(), utils.modules.invalidate(), utils.promoModules.invalidate()]);
    } catch {
      setError("Erreur réseau pendant l'import.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
      <button onClick={triggerFilePicker} disabled={uploading} className="btn-glass">
        <IconFileSpreadsheet size={18} />
        {uploading ? "Import en cours..." : "Importer un Excel"}
      </button>

      {error && !result && (
        <Modal
          opened
          onClose={() => setError(null)}
          withCloseButton={false}
          centered
          radius="lg"
          classNames={{ content: "!bg-white/90 !backdrop-blur-2xl", body: "p-0" }}
        >
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <IconAlertTriangle size={20} className="shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="btn-secondary w-full justify-center">
              Fermer
            </button>
          </div>
        </Modal>
      )}

      <Modal
        opened={!!result}
        onClose={() => setResult(null)}
        withCloseButton={false}
        centered
        radius="lg"
        size="lg"
        overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
        classNames={{ content: "!bg-white/90 !backdrop-blur-2xl", body: "p-0" }}
      >
        {result && (
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                  <IconUpload size={16} />
                </span>
                Résultat de l&apos;import
              </h3>
              <button
                onClick={() => setResult(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-white/60 py-2">
                <div className="text-lg font-semibold text-gray-900">{result.summary.sheetsProcessed}</div>
                <div className="text-xs text-gray-500">Promos traitées</div>
              </div>
              <div className="rounded-lg bg-white/60 py-2">
                <div className="text-lg font-semibold text-gray-900">{result.summary.modulesCreated}</div>
                <div className="text-xs text-gray-500">Modules créés</div>
              </div>
              <div className="rounded-lg bg-white/60 py-2">
                <div className="text-lg font-semibold text-gray-500">{result.summary.sheetsSkipped}</div>
                <div className="text-xs text-gray-500">Ignorées</div>
              </div>
              <div className="rounded-lg bg-white/60 py-2">
                <div className="text-lg font-semibold text-red-600">{result.summary.sheetsErrored}</div>
                <div className="text-xs text-gray-500">En erreur</div>
              </div>
            </div>

            {result.summary.extraSheetsIgnored > 0 && (
              <p className="mb-3 text-xs text-amber-600">
                {result.summary.extraSheetsIgnored} feuille(s) supplémentaire(s) non traitée(s) (limite atteinte).
              </p>
            )}

            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {result.sheets.map((sheet) => {
                const style = statusStyles[sheet.status];
                const Icon = style.icon;
                return (
                  <div key={sheet.name} className={`rounded-lg border px-3 py-2.5 ${style.classes}`}>
                    <div className="flex items-start gap-2">
                      <Icon size={16} className="mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          {sheet.name}
                          {sheet.status === "ok" && (
                            <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium">
                              {sheet.promoStatus === "reused" ? "promo existante" : "promo créée"} ·{" "}
                              {sheet.modulesCreated} module(s)
                            </span>
                          )}
                        </div>
                        {sheet.reason && <p className="mt-0.5 text-xs">{sheet.reason}</p>}
                        {sheet.rowErrors.length > 0 && (
                          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
                            {sheet.rowErrors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setResult(null)}
              className="btn-primary mt-5 w-full justify-center"
            >
              Fermer
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
