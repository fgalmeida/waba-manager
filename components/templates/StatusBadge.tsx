import { Badge } from "@/components/ui/badge";
import type { TemplateStatus } from "@/types/meta";

const statusColors: Record<TemplateStatus, string> = {
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  PAUSED: "bg-orange-100 text-orange-800 border-orange-300",
  DISABLED: "bg-gray-100 text-gray-800 border-gray-300",
  DELETED: "bg-gray-100 text-gray-500 border-gray-200 line-through",
};

const statusLabels: Record<TemplateStatus, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Rejeitado",
  PAUSED: "Pausado",
  DISABLED: "Desativado",
  DELETED: "Excluido",
};

interface StatusBadgeProps {
  status: TemplateStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${statusColors[status] ?? ""} font-medium`}
    >
      {statusLabels[status] ?? status}
    </Badge>
  );
}
