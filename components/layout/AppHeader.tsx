"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, ChevronDown, MessageSquareText } from "lucide-react";

interface Account {
  id: string;
  name: string;
}

export function AppHeader() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const [accRes, activeRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/accounts/active"),
      ]);

      if (accRes.ok) {
        const data = await accRes.json();
        setAccounts(data);
      }

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveId(data.activeAccountId);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const switchAccount = async (id: string) => {
    await fetch("/api/accounts/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: id }),
    });
    setActiveId(id);
    window.location.reload();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const activeAccount = accounts.find((a) => a.id === activeId);

  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/templates" className="flex items-center gap-2 font-semibold">
          <MessageSquareText className="h-5 w-5 text-primary" />
          <span>WhatsApp Templates</span>
        </Link>

        <div className="flex items-center gap-2">
          {accounts.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium h-7 px-2.5">
                {activeAccount?.name ?? "Selecionar conta"}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {accounts.map((acc) => (
                  <DropdownMenuItem
                    key={acc.id}
                    onClick={() => switchAccount(acc.id)}
                    className={acc.id === activeId ? "font-semibold" : ""}
                  >
                    {acc.name}
                    {acc.id === activeId && " (ativa)"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
