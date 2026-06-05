"use client";

import { Megaphone, Wrench, Shield } from "lucide-react";
import type { TemplateCategory } from "@/types/meta";

interface CategoryIconProps {
  category: TemplateCategory;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const config: Record<TemplateCategory, { icon: typeof Megaphone; label: string; desc: string; color: string }> = {
  MARKETING: {
    icon: Megaphone,
    label: "Marketing",
    desc: "Para ofertas, promocoes e novidades. Envio iniciado pela empresa.",
    color: "text-orange-500",
  },
  UTILITY: {
    icon: Wrench,
    label: "Utilidade",
    desc: "Para atualizacoes de pedido, recibos e confirmacoes. Envio iniciado pelo cliente.",
    color: "text-blue-500",
  },
  AUTHENTICATION: {
    icon: Shield,
    label: "Autenticacao",
    desc: "Para codigos OTP, verificacao de conta e seguranca.",
    color: "text-green-500",
  },
};

export function CategoryIcon({ category, showLabel, size = "md" }: CategoryIconProps) {
  const { icon: Icon, label, desc, color } = config[category] ?? config.MARKETING;
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-1.5" title={desc}>
      <Icon className={`${iconSize} ${color}`} />
      {showLabel && (
        <span className={`${textSize} font-medium`}>{label}</span>
      )}
    </div>
  );
}
