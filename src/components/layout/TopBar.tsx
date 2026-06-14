"use client";
import * as React from "react";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isSupabaseConfigured } from "@/lib/supabase";

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-bold text-white text-sm">D</div>
        <span className="font-bold">DUPPLO</span>
      </div>
      <div className="hidden md:block">
        {!isSupabaseConfigured && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Modo demo · datos de ejemplo (configura Supabase para persistir)
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">FI</div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight">Felipe Inspector</p>
              <p className="text-[11px] text-muted-foreground leading-tight">CEO</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Perfil</DropdownMenuItem>
            <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" /> Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
