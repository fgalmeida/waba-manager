"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle, XCircle, Loader2, Wifi } from "lucide-react";
import { toast } from "sonner";

interface AccountItem {
  id: string;
  name: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [validating, setValidating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    accessToken: "",
    wabaId: "",
    phoneNumberId: "",
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const [accRes, activeRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/accounts/active"),
      ]);
      if (accRes.ok) setAccounts(await accRes.json());
      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveId(data.activeAccountId);
      }
    } catch {
      toast.error("Erro ao carregar contas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const resetForm = () => {
    setForm({ name: "", accessToken: "", wabaId: "", phoneNumberId: "" });
    setEditTarget(null);
  };

  const openEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setForm({
        name: data.name,
        accessToken: "",
        wabaId: "",
        phoneNumberId: "",
      });
      setEditTarget(id);
      setShowAdd(true);
    } catch {
      toast.error("Erro ao carregar conta");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.accessToken || !form.wabaId || !form.phoneNumberId) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSaving(true);
    try {
      const url = editTarget ? `/api/accounts/${editTarget}` : "/api/accounts";
      const method = editTarget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar");
      }

      toast.success(
        editTarget
          ? "Conta atualizada com sucesso"
          : "Conta criada com sucesso"
      );
      setShowAdd(false);
      resetForm();
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deletar a conta "${name}"?`)) return;

    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");
      toast.success("Conta removida");
      if (activeId === id) setActiveId(null);
      fetchAccounts();
    } catch {
      toast.error("Erro ao deletar conta");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch("/api/accounts/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });
      if (!res.ok) throw new Error("Erro");
      setActiveId(id);
      toast.success("Conta ativada");
    } catch {
      toast.error("Erro ao ativar conta");
    }
  };

  const handleValidate = async (id: string) => {
    setValidating(id);
    try {
      const res = await fetch(`/api/accounts/${id}/validate`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Conexao validada com sucesso!");
      } else {
        toast.error(`Erro: ${data.error ?? "Credenciais invalidas"}`);
      }
    } catch {
      toast.error("Erro ao validar");
    } finally {
      setValidating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contas Meta</h1>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma conta Meta configurada.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar primeira conta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => (
            <Card key={acc.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold">{acc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Criada em{" "}
                      {new Date(acc.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {acc.id === activeId && (
                    <Badge variant="secondary" className="text-xs">
                      Ativa
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleValidate(acc.id)}
                    disabled={validating === acc.id}
                  >
                    {validating === acc.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Wifi className="h-3 w-3 mr-1" />
                    )}
                    Validar
                  </Button>

                  {acc.id !== activeId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivate(acc.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativar
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(acc.id)}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(acc.id, acc.name)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Editar Conta" : "Nova Conta Meta"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Minha Empresa"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Access Token *</Label>
              <Input
                type="password"
                placeholder="EAAxxxx..."
                value={form.accessToken}
                onChange={(e) =>
                  setForm({ ...form, accessToken: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>WABA ID *</Label>
              <Input
                placeholder="1234567890"
                value={form.wabaId}
                onChange={(e) =>
                  setForm({ ...form, wabaId: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Phone Number ID *</Label>
              <Input
                placeholder="9876543210"
                value={form.phoneNumberId}
                onChange={(e) =>
                  setForm({ ...form, phoneNumberId: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
