"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Wallet, HardHat, Users, FolderKanban,
  FileText, ShoppingCart, Receipt, Coins, Building2, UserCog, Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const dashboards = [
  { href: "/dashboard/ceo", label: "CEO", icon: LayoutDashboard },
  { href: "/dashboard/comercial", label: "Comercial", icon: TrendingUp },
  { href: "/dashboard/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/dashboard/operaciones", label: "Operaciones", icon: HardHat },
];

const modules = [
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/ordenes-compra", label: "Órdenes de Compra", icon: ShoppingCart },
  { href: "/facturas", label: "Facturas", icon: Receipt },
  { href: "/cobros", label: "Cobros", icon: Coins },
  { href: "/obras", label: "Obras", icon: Building2 },
  { href: "/personal", label: "Personal", icon: UserCog },
  { href: "/proveedores", label: "Proveedores", icon: Truck },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-primary text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-white">
      <div className="flex h-14 items-center gap-2 px-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-bold">D</div>
        <div className="leading-tight">
          <p className="font-bold tracking-wide">DUPPLO</p>
          <p className="text-[10px] text-slate-400">OS V1</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Dashboards</p>
          <div className="space-y-1">
            {dashboards.map((d) => <NavItem key={d.href} {...d} />)}
          </div>
        </div>
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Módulos</p>
          <div className="space-y-1">
            {modules.map((m) => <NavItem key={m.href} {...m} />)}
          </div>
        </div>
      </nav>
      <div className="border-t border-slate-800 p-4 text-[10px] text-slate-500">
        © 2026 Dupplo SpA
      </div>
    </aside>
  );
}
