"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { Obra, Cliente, Proyecto, Personal } from "@/lib/types";
import { fetchAll, updateRow, deleteRow } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ObraDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [obra, setObra] = React.useState<Obra | null>(null);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [proyectos, setProyectos] = React.useState<Proyecto[]>([]);
  const [personal, setPersonal] = React.useState<Personal[]>([]);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    fetchAll<Obra>("obras").then((rows) => setObra(rows.find((o) => o.id === id) || null));
    fetchAll<Cliente>("clientes").then(setClientes);
    fetchAll<Proyecto>("proyectos").then(setProyectos);
    fetchAll<Personal>("personal").then(setPersonal);
  }, [id]);

  if (!obra) return <p className="text-muted-foreground">Cargando obra...</p>;

  async function save() {
    if (!obra) return;
    await updateRow("obras", obra.id, obra);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  async function remove() {
    if (!obra) return;
    if (confirm("¿Eliminar esta obra?")) {
      await deleteRow("obras", obra.id);
      router.push("/obras");
    }
  }

  const set = (patch: Partial<Obra>) => setObra({ ...obra, ...patch });

  const margen = (obra.presupuesto ?? 0) - (obra.costo_real ?? 0);
  const margenPct = obra.presupuesto ? Math.round((margen / obra.presupuesto) * 100) : 0;
  const avance = Math.min(100, Math.max(0, obra.avance_pct ?? 0));

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => router.push("/obras")}>
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>
      <PageHeader
        title={obra.nombre}
        subtitle={`Código ${obra.codigo}`}
        action={
          <div className="flex gap-2">
            <Button variant="destructive" onClick={remove}><Trash2 className="h-4 w-4" /> Eliminar</Button>
            <Button onClick={save}><Save className="h-4 w-4" /> {saved ? "Guardado" : "Guardar"}</Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Información de la obra</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Código</Label><Input value={obra.codigo} onChange={(e) => set({ codigo: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Nombre</Label><Input value={obra.nombre} onChange={(e) => set({ nombre: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Proyecto</Label>
              <Select value={obra.proyecto_id ?? ""} onChange={(e) => set({ proyecto_id: e.target.value || null })}>
                <option value="">— Sin asignar —</option>
                {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </Select></div>
            <div className="space-y-1.5"><Label>Cliente</Label>
              <Select value={obra.cliente_id ?? ""} onChange={(e) => set({ cliente_id: e.target.value || null })}>
                <option value="">— Sin asignar —</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
              </Select></div>
            <div className="space-y-1.5"><Label>Tipo</Label>
              <Select value={obra.tipo} onChange={(e) => set({ tipo: e.target.value })}
                options={[{ value: "edificacion", label: "Edificación" }, { value: "remodelacion", label: "Remodelación" }, { value: "obra_civil", label: "Obra civil" }]} /></div>
            <div className="space-y-1.5"><Label>Estado</Label>
              <Select value={obra.estado} onChange={(e) => set({ estado: e.target.value })}
                options={[{ value: "pendiente", label: "Pendiente" }, { value: "en_proceso", label: "En proceso" }, { value: "completada", label: "Completada" }]} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Dirección</Label><Input value={obra.direccion} onChange={(e) => set({ direccion: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Fecha Inicio Plan</Label><Input type="date" value={obra.fecha_inicio_plan ?? ""} onChange={(e) => set({ fecha_inicio_plan: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Fecha Fin Plan</Label><Input type="date" value={obra.fecha_fin_plan ?? ""} onChange={(e) => set({ fecha_fin_plan: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Presupuesto</Label><CurrencyInput value={obra.presupuesto ?? 0} onChange={(n) => set({ presupuesto: n })} /></div>
            <div className="space-y-1.5"><Label>Costo Real</Label><CurrencyInput value={obra.costo_real ?? 0} onChange={(n) => set({ costo_real: n })} /></div>
            <div className="space-y-1.5"><Label>Jefe de Obra</Label>
              <Select value={obra.jefe_obra_id ?? ""} onChange={(e) => set({ jefe_obra_id: e.target.value || null })}>
                <option value="">— Sin asignar —</option>
                {personal.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </Select></div>
            <div className="space-y-1.5"><Label>Avance %</Label><Input type="number" value={obra.avance_pct ?? 0} onChange={(e) => set({ avance_pct: Number(e.target.value) })} /></div>
            <div className="col-span-2 space-y-1.5">
              <Label>Progreso</Label>
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${avance}%` }} />
                </div>
                <span className="text-sm font-medium">{avance}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Margen</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-bold">{formatCurrency(margen)}</p>
              <p className="text-sm text-muted-foreground">{margenPct}% del presupuesto</p>
              <div className="pt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Presupuesto</span><span>{formatCurrency(obra.presupuesto ?? 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Costo real</span><span>{formatCurrency(obra.costo_real ?? 0)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
