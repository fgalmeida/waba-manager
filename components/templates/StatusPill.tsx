"use client";

import type { TemplateStatus } from "@/types/meta";

interface StatusPillProps {
  status: TemplateStatus;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

const statusColors: Record<TemplateStatus, { bg: string; text: string; ring: string }> = {
  APPROVED: { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-400" },
  PENDING: { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-400" },
  REJECTED: { bg: "bg-red-100", text: "text-red-800", ring: "ring-red-400" },
  PAUSED: { bg: "bg-orange-100", text: "text-orange-800", ring: "ring-orange-400" },
  DISABLED: { bg: "bg-gray-100", text: "text-gray-600", ring: "ring-gray-400" },
  DELETED: { bg: "bg-gray-100", text: "text-gray-400", ring: "ring-gray-300" },
};

const statusIcons: Record<TemplateStatus, string> = {
  APPROVED: "✓",
  PENDING: "⏳",
  REJECTED: "✕",
  PAUSED: "⏸",
  DISABLED: "⊘",
  DELETED: "✕",
};

const statusLabels: Record<TemplateStatus, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Rejeitado",
  PAUSED: "Pausado",
  DISABLED: "Desativado",
  DELETED: "Excluido",
};

export function StatusPill({ status, active, count, onClick }: StatusPillProps) {
  const colors = statusColors[status] ?? statusColors.DISABLED;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer
        ${colors.bg} ${colors.text}
        ${active ? `ring-2 ${colors.ring} shadow-sm scale-105` : "hover:scale-105 hover:shadow-sm"}
        ${!onClick ? "cursor-default" : ""}`}
    >
      <span>{statusIcons[status]}</span>
      <span>{statusLabels[status]}</span>
      {count !== undefined && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? "bg-white/60" : "bg-black/10"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
