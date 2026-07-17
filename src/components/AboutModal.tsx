"use client";

import React from "react";
import { Modal, UnstyledButton } from "@mantine/core";
import {
  IconBuildingSkyscraper,
  IconX,
  IconBrandGithub,
  IconUser,
  IconTag,
  IconScale,
} from "@tabler/icons-react";

interface AboutModalProps {
  opened: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ opened, onClose }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size={440}
      padding={0}
      radius="xl"
      classNames={{
        content: "!overflow-hidden !bg-white",
        overlay: "!backdrop-blur-sm",
      }}
    >
      {/* ── Header gradient ── */}
      <div
        className="relative flex flex-col px-7 pt-8 pb-7"
        style={{
          background:
            "linear-gradient(140deg, #1a5c57 0%, #1e6b65 45%, #1d6560 100%)",
        }}
      >
        {/* Teal glow blob */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 260px 160px at 80% 110%, rgba(47,182,169,0.22), transparent)",
          }}
        />

        {/* Close button */}
        <UnstyledButton
          onClick={onClose}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          <IconX size={14} />
        </UnstyledButton>

        {/* Icon + name */}
        <div className="relative flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(47,182,169,0.35) 0%, rgba(26,136,128,0.5) 100%)",
              boxShadow: "0 0 0 1px rgba(47,182,169,0.25) inset",
            }}
          >
            <IconBuildingSkyscraper size={24} className="text-teal-300" />
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-widest text-teal-400/80 uppercase">
              Ynov Management
            </p>
            <h2
              className="mt-0.5 text-xl leading-tight font-bold text-white"
              style={{ letterSpacing: "-0.01em" }}
            >
              YBoard Intervenants
            </h2>
          </div>
        </div>

        {/* Version badge */}
        <div className="relative mt-5 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{
              background: "rgba(47,182,169,0.15)",
              border: "1px solid rgba(47,182,169,0.3)",
              color: "#6ee7e0",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#2fb6a9" }}
            />
            v2.0.0
          </span>
          <span className="text-[11px] text-white/30">
            Gestion des intervenants pédagogiques
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="space-y-5 px-7 py-6">
        {/* Info chips */}
        <div className="grid grid-cols-1 gap-3">
          <InfoRow
            icon={<IconUser size={14} />}
            label="Développeur"
            value="Eric PHILIPPE"
          />
          <InfoRow icon={<IconTag size={14} />} label="Version" value="2.0.0" />
        </div>

        {/* GitHub CTA */}
        <a
          href="https://github.com/Eric-Philippe/YBoard-Intervenants"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 hover:-translate-y-px"
          style={{
            borderColor: "rgba(47,182,169,0.25)",
            background: "rgba(47,182,169,0.04)",
          }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{
              background: "rgba(47,182,169,0.12)",
            }}
          >
            <IconBrandGithub size={16} style={{ color: "#24b2a6" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800">
              Eric-Philippe / YBoard-Intervenants
            </p>
            <p className="text-xs text-gray-400">github.com</p>
          </div>
          <svg
            className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-teal-500"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        {/* Legal */}
        <div
          className="space-y-1 rounded-xl px-4 py-3.5"
          style={{
            background: "#f8fffe",
            border: "1px solid rgba(47,182,169,0.12)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <IconScale size={12} style={{ color: "#24b2a6" }} />
            <p
              className="text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: "#1a8880" }}
            >
              Mention légale
            </p>
          </div>
          <p className="text-[11.5px] leading-relaxed text-gray-500">
            Tout contenu dirigé pour l&apos;établissement, incluant les données
            relatives aux promotions, modules et intervenants, est à usage
            strictement interne. La diffusion, reproduction ou exploitation de
            ces informations en dehors du cadre institutionnel est interdite
            sans autorisation expresse.
          </p>
        </div>
      </div>
    </Modal>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div
    className="flex items-center gap-3 rounded-xl px-4 py-2.5"
    style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}
  >
    <span className="shrink-0 text-gray-400">{icon}</span>
    <span className="w-24 shrink-0 text-xs text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);
