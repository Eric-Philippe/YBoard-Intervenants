"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { Modal, ColorInput, Progress, Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconTrash,
  IconSettings,
  IconPencil,
  IconUsers,
  IconCheck,
  IconUserPlus,
  IconUserMinus,
  IconLayoutDashboard,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import { useAuth } from "~/contexts/AuthContext";
import { api, type RouterOutputs } from "~/trpc/react";
import { ExportCompletionModal } from "./ExportCompletionModal";

interface PerimeterFormData {
  title: string;
  color: string;
  short_desc: string;
}

type PerimeterSummary = RouterOutputs["perimeters"]["getAll"][number];

function PerimeterStats({ perimeterId }: { perimeterId: string }) {
  const { data: stats } = api.perimeters.getStats.useQuery({ perimeterId });

  if (!stats) return null;

  return (
    <div className="mt-5 space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-white/60 py-3">
          <div className="text-xl font-semibold text-gray-900">{stats.promoCount}</div>
          <div className="mt-0.5 text-xs text-gray-500">Promos</div>
        </div>
        <div className="rounded-xl bg-white/60 py-3">
          <div className="text-xl font-semibold text-gray-900">{stats.moduleCount}</div>
          <div className="mt-0.5 text-xs text-gray-500">Modules</div>
        </div>
        <div className="rounded-xl bg-white/60 py-3">
          <div className="text-xl font-semibold text-gray-900">{stats.memberCount}</div>
          <div className="mt-0.5 text-xs text-gray-500">Membres</div>
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-gray-500">
          <span>Complétion des modules</span>
          <span>{stats.completionRate}%</span>
        </div>
        <Progress value={stats.completionRate} color="teal" size="sm" radius="xl" />
      </div>
    </div>
  );
}

function MembersPanel({ perimeterId }: { perimeterId: string }) {
  const utils = api.useUtils();
  const { data: users = [] } = api.users.getAll.useQuery();
  const { data: perimeter } = api.perimeters.getById.useQuery({ id: perimeterId });
  const memberIds = perimeter?.members.map((m) => m.userId) ?? [];

  const addMember = api.perimeters.addMember.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.perimeters.getAll.invalidate(),
        utils.perimeters.getById.invalidate({ id: perimeterId }),
      ]);
    },
  });
  const removeMember = api.perimeters.removeMember.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.perimeters.getAll.invalidate(),
        utils.perimeters.getById.invalidate({ id: perimeterId }),
        utils.perimeters.getMine.invalidate(),
      ]);
    },
  });

  return (
    <div className="mt-5 border-t border-gray-100 pt-5">
      <div className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Membres
      </div>
      <div className="max-h-56 space-y-1 overflow-auto pr-1">
        {users.map((u) => {
          const isMember = memberIds.includes(u.id);
          return (
            <div
              key={u.id}
              className="surface-hover flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-white/70"
            >
              <span className="truncate text-gray-700">
                {u.firstname} {u.lastname}
              </span>
              {isMember ? (
                <button
                  onClick={() => removeMember.mutate({ perimeterId, userId: u.id })}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <IconUserMinus size={14} />
                  Retirer
                </button>
              ) : (
                <button
                  onClick={() => addMember.mutate({ perimeterId, userId: u.id })}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
                >
                  <IconUserPlus size={14} />
                  Ajouter
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerimeterCard({
  perimeter,
  isMember,
  isActive,
  expanded,
  onToggleExpand,
  onJoin,
  onActivate,
  onDelete,
  onEdit,
}: {
  perimeter: PerimeterSummary;
  isMember: boolean;
  isActive: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onJoin: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="glass-card surface-hover flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="h-9 w-9 shrink-0 rounded-xl shadow-inner"
            style={{ backgroundColor: perimeter.color }}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-semibold text-gray-900">{perimeter.title}</h2>
              {isActive && (
                <Badge size="xs" color="teal" variant="light">
                  Actif
                </Badge>
              )}
            </div>
            <div className="mt-0.5 truncate text-sm text-gray-600">
              Origine : {perimeter.origin}
            </div>
            {perimeter.short_desc && (
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">{perimeter.short_desc}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Modifier"
          >
            <IconSettings size={16} />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Supprimer"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      <PerimeterStats perimeterId={perimeter.id} />

      <div className="mt-5 flex flex-col gap-2">
        {isMember ? (
          <button
            disabled={isActive}
            onClick={onActivate}
            className="btn-primary w-full justify-center disabled:translate-y-0"
          >
            <IconCheck size={16} />
            {isActive ? "Périmètre actif" : "Utiliser ce périmètre"}
          </button>
        ) : (
          <button onClick={onJoin} className="btn-secondary w-full justify-center">
            Rejoindre
          </button>
        )}
        <button onClick={onToggleExpand} className="btn-glass w-full justify-center">
          <IconUsers size={16} />
          Membres
        </button>
      </div>

      {expanded && <MembersPanel perimeterId={perimeter.id} />}

      <div className="mt-4 truncate font-mono text-[11px] text-gray-400">
        /{perimeter.slug}
      </div>
    </div>
  );
}

export default function PerimetresPage() {
  const { user } = useAuth();
  const utils = api.useUtils();
  const [createModal, setCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [editTarget, setEditTarget] = useState<PerimeterSummary | null>(null);
  const [exportModal, setExportModal] = useState(false);

  const { data: perimeters = [], isLoading } = api.perimeters.getAll.useQuery();
  const { data: mine } = api.perimeters.getMine.useQuery(undefined, { enabled: !!user });

  const createForm = useForm<PerimeterFormData>({
    initialValues: { title: "", color: "#24b2a6", short_desc: "" },
    validate: {
      title: (v) => (v.trim().length === 0 ? "Le titre est requis" : null),
    },
  });

  const editForm = useForm<PerimeterFormData>({
    initialValues: { title: "", color: "#24b2a6", short_desc: "" },
    validate: {
      title: (v) => (v.trim().length === 0 ? "Le titre est requis" : null),
    },
  });

  const createMutation = api.perimeters.create.useMutation({
    onSuccess: async () => {
      // Creating a perimeter also makes it the creator's active perimeter
      // server-side, so every perimeter-scoped query needs a refetch too.
      await Promise.all([
        utils.perimeters.getAll.invalidate(),
        utils.perimeters.getMine.invalidate(),
        utils.promos.invalidate(),
        utils.modules.invalidate(),
        utils.promoModules.invalidate(),
      ]);
      setCreateModal(false);
      createForm.reset();
      notifications.show({ message: "Périmètre créé", color: "green" });
    },
    onError: (error) => {
      notifications.show({ message: `Erreur : ${error.message}`, color: "red" });
    },
  });

  const updateMutation = api.perimeters.update.useMutation({
    onSuccess: async () => {
      await utils.perimeters.getAll.invalidate();
      setEditTarget(null);
      notifications.show({ message: "Périmètre mis à jour", color: "green" });
    },
    onError: (error) => {
      notifications.show({ message: `Erreur : ${error.message}`, color: "red" });
    },
  });

  const openEditModal = (p: PerimeterSummary) => {
    editForm.setValues({ title: p.title, color: p.color, short_desc: p.short_desc ?? "" });
    setEditTarget(p);
  };

  const deleteMutation = api.perimeters.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.perimeters.getAll.invalidate(),
        utils.perimeters.getMine.invalidate(),
      ]);
      notifications.show({ message: "Périmètre supprimé", color: "green" });
    },
    onError: (error) => {
      notifications.show({ message: `Erreur : ${error.message}`, color: "red" });
    },
  });

  const setActive = api.perimeters.setActive.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.perimeters.getMine.invalidate(),
        utils.promos.invalidate(),
        utils.modules.invalidate(),
        utils.promoModules.invalidate(),
      ]);
      notifications.show({ message: "Périmètre actif change", color: "blue" });
    },
  });

  const joinAndActivate = api.perimeters.addMember.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.perimeters.getAll.invalidate();
      setActive.mutate({ perimeterId: variables.perimeterId });
    },
  });

  const handleDelete = (id: string, title: string) => {
    setPendingDelete({ id, title });
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25">
              <IconLayoutDashboard size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des périmètres</h1>
              <p className="text-sm text-gray-500">
                Vue d&apos;ensemble, création et attribution des périmètres
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setExportModal(true)} className="btn-glass">
              <IconFileSpreadsheet size={16} />
              Exporter la complétion
            </button>
            <button onClick={() => setCreateModal(true)} className="btn-primary">
              <IconPlus size={16} />
              Créer un périmètre
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="glass-card p-10 text-center text-gray-500">Chargement...</div>
        ) : perimeters.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-500">
            Aucun périmètre pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {perimeters.map((p) => (
              <PerimeterCard
                key={p.id}
                perimeter={p}
                isMember={mine?.perimeters.some((mp) => mp.id === p.id) ?? false}
                isActive={mine?.activePerimeterId === p.id}
                expanded={expandedId === p.id}
                onToggleExpand={() => setExpandedId(expandedId === p.id ? null : p.id)}
                onJoin={() => user && joinAndActivate.mutate({ perimeterId: p.id, userId: user.id })}
                onActivate={() => setActive.mutate({ perimeterId: p.id })}
                onDelete={() => handleDelete(p.id, p.title)}
                onEdit={() => openEditModal(p)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        opened={createModal}
        onClose={() => setCreateModal(false)}
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
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <IconLayoutDashboard size={16} />
              </span>
              Créer un périmètre
            </h3>
            <button
              onClick={() => setCreateModal(false)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form
            onSubmit={createForm.onSubmit((values) => createMutation.mutate(values))}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
              <input
                type="text"
                className="input-glass"
                placeholder="Ex : Promo Data 2026"
                {...createForm.getInputProps("title")}
              />
              {createForm.errors.title && (
                <p className="mt-1 text-sm text-red-600">{createForm.errors.title}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Couleur</label>
              <ColorInput {...createForm.getInputProps("color")} format="hex" radius="md" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description courte <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="text"
                className="input-glass"
                placeholder="Ex : Année scolaire 2025-2026, campus Lyon"
                maxLength={255}
                {...createForm.getInputProps("short_desc")}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreateModal(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary flex-1 justify-center"
              >
                {createMutation.isPending ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Perimeter Modal */}
      <Modal
        opened={!!editTarget}
        onClose={() => setEditTarget(null)}
        withCloseButton={false}
        centered
        radius="lg"
        size="lg"
        overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
        classNames={{ content: "!bg-white/85 !backdrop-blur-2xl", body: "p-0" }}
      >
        {editTarget && (
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                  <IconPencil size={16} />
                </span>
                Modifier le périmètre
              </h3>
              <button
                onClick={() => setEditTarget(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={editForm.onSubmit((values) =>
                updateMutation.mutate({
                  id: editTarget.id,
                  title: values.title,
                  color: values.color,
                  short_desc: values.short_desc || null,
                })
              )}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Ex : Promo Data 2026"
                  {...editForm.getInputProps("title")}
                />
                {editForm.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{editForm.errors.title}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Couleur</label>
                <ColorInput {...editForm.getInputProps("color")} format="hex" radius="md" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description courte <span className="text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Ex : Année scolaire 2025-2026, campus Lyon"
                  maxLength={255}
                  {...editForm.getInputProps("short_desc")}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn-primary flex-1 justify-center"
                >
                  {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      <Modal
        opened={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        withCloseButton={false}
        centered
        radius="lg"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
        classNames={{ content: "!bg-white/90 !backdrop-blur-2xl", body: "p-0" }}
      >
        {pendingDelete && (
          <div className="p-6">
            <h3 className="mb-2 text-base font-semibold text-gray-900">Supprimer le périmètre</h3>
            <p className="mb-1 text-sm text-gray-700">
              Supprimer <strong>{pendingDelete.title}</strong> et toutes ses données (promos, modules) ?
            </p>
            <p className="mb-5 text-xs text-gray-400">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingDelete(null)} className="btn-secondary flex-1 justify-center">
                Annuler
              </button>
              <button
                onClick={() => { deleteMutation.mutate({ id: pendingDelete.id }); setPendingDelete(null); }}
                disabled={deleteMutation.isPending}
                className="btn-danger flex-1 justify-center"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ExportCompletionModal
        opened={exportModal}
        onClose={() => setExportModal(false)}
        perimeters={perimeters.map((p) => ({
          id: p.id,
          title: p.title,
          color: p.color,
          promoCount: p._count.promos,
        }))}
      />
    </div>
  );
}
