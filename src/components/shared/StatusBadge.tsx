import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GREEN = new Set(["activo", "cobrado", "completada", "aprobada", "pagada", "adjudicada"]);
const YELLOW = new Set(["pendiente", "en_proceso", "en_revision", "programado", "enviada"]);
const RED = new Set(["vencida", "atrasada", "rechazada", "bloqueada", "anulada"]);
const GRAY = new Set(["borrador", "inactivo", "cerrada", "cancelada"]);

export function statusColor(estado: string): string {
  const e = (estado || "").toLowerCase();
  if (GREEN.has(e)) return "bg-green-100 text-green-800 border-green-200";
  if (YELLOW.has(e)) return "bg-amber-100 text-amber-800 border-amber-200";
  if (RED.has(e)) return "bg-red-100 text-red-800 border-red-200";
  if (GRAY.has(e)) return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
}

export function StatusBadge({ estado, className }: { estado: string; className?: string }) {
  const label = (estado || "—").replace(/_/g, " ");
  return (
    <Badge className={cn("capitalize", statusColor(estado), className)}>{label}</Badge>
  );
}
