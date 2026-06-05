"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTemplateStore } from "@/lib/stores/template-store";
import { TemplateCard } from "./TemplateCard";
import { DeleteDialog } from "./DeleteDialog";
import { EmptyState } from "./EmptyState";
import { StatusPill } from "./StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import type { Template, TemplateStatus } from "@/types/meta";

const ALL_STATUSES: TemplateStatus[] = ["APPROVED", "PENDING", "REJECTED", "PAUSED", "DISABLED"];

export function TemplateList() {
  const router = useRouter();
  const { templates, filters, loading, error, setFilter, clearFilters, fetchTemplates, removeTemplate } = useTemplateStore();
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_STATUSES.forEach((s) => (counts[s] = 0));
    templates.forEach((t) => { counts[t.status] = (counts[t.status] ?? 0) + 1; });
    return counts;
  }, [templates]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchInput(value);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilter("search", value);
        fetchTemplates();
      }, 300);
    },
    [setFilter, fetchTemplates]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/templates/${deleteTarget.id}?name=${encodeURIComponent(deleteTarget.name)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir");
      removeTemplate(deleteTarget.name);
      toast.success("Template excluido com sucesso");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message ?? "Erro ao excluir template");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusFilter = (status: TemplateStatus) => {
    if (filters.status === status) {
      setFilter("status", "");
    } else {
      setFilter("status", status);
    }
    fetchTemplates();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seus Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {templates.length} template{templates.length !== 1 ? "s" : ""} encontrado{templates.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => router.push("/templates/new")}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Template
          </Button>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.filter((s) => (stats[s] ?? 0) > 0).map((status) => (
            <StatusPill
              key={status}
              status={status}
              active={filters.status === status}
              count={stats[status]}
              onClick={() => handleStatusFilter(status)}
            />
          ))}
          {filters.status && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => { setFilter("status", ""); fetchTemplates(); }}
            >
              <X className="h-3 w-3 mr-1" />
              Limpar filtro
            </Button>
          )}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome do template..."
          className="pl-8 h-9"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchInput && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[260px] rounded-lg" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState hasFilters={!!(filters.status || filters.search)} onCreateClick={() => router.push("/templates/new")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        templateName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
