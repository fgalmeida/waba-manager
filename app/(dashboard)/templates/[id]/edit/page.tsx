"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TemplateForm } from "@/components/templates/TemplateForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import type { Template } from "@/types/meta";

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/templates/${id}`);
        if (!res.ok) throw new Error("Nao encontrado");
        const data = await res.json();

        if (data.status !== "APPROVED" && data.status !== "REJECTED") {
          setForbidden(true);
          return;
        }

        setTemplate(data);
      } catch {
        router.push("/templates");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardContent className="pt-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-amber-100 rounded-full p-3">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <h3 className="font-semibold text-lg">Edicao nao permitida</h3>
          <p className="text-sm text-muted-foreground">
            Apenas templates com status <strong>Aprovado</strong> ou <strong>Rejeitado</strong> podem ser editados.
            Templates Pendentes estao em analise pela Meta.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!template) return null;

  return <TemplateForm template={template} />;
}
