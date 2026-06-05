"use client";

import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters?: boolean;
  onCreateClick: () => void;
}

export function EmptyState({ hasFilters, onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-muted/50 rounded-full p-6 mb-4">
        <MessageSquarePlus className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {hasFilters ? "Nenhum template encontrado" : "Nenhum template ainda"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {hasFilters
          ? "Tente ajustar os filtros ou limpar a busca para ver mais resultados."
          : "Crie seu primeiro template de mensagem em segundos. E facil, rapido e visual!"}
      </p>
      {!hasFilters && (
        <Button onClick={onCreateClick} size="lg">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Criar primeiro template
        </Button>
      )}
    </div>
  );
}
