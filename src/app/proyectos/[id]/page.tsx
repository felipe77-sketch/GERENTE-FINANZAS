"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { Proyecto, Cliente, Cotizacion, Obra } from "@/lib/types";
import { fetchAll, updateRow, deleteRow } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProyectoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [proyecto, setProyecto] = React.useState<Proyecto | null>(null);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [cotizaciones, setCotizaciones] = React.useState<Cotizacion[]>([]);
  const [obras, setObras] = React.useState<Obra[]>([]);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    fetchAll<Proyecto>("proyectos").then((rows) => setProyecto(rows.find((p) => p.id === id) || null));
    fetchAll<Cliente>("clientes").then(setClientes);
    fetchAll<Cotizacion>("cotizaciones").then((rows) => setCotizaciones(rows.filter((c) => c.proyecto_id === id)));
    fetchAll<Obra>("obras").then((rows) => setObras(rows.filter((o) => o.proyecto_id === id)));
  }, [id]);

  if (!proyecto) return <p className="text-muted-foreground">Cargando proyecto...</p>;

  async function save() {
    if (!proyecto) return;
    await updateRow("proyectos", proyecto.id, proyecto);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  async function remove() {
    if (!proyecto) return;
    if (confirm("¿Eliminar este proyecto?")) {
      await deleteRow("proyectos", proyecto.id);
      router.push("/proyectos");
    }
  }

  const set = (patch: Partial<Proyecto>) => setProyecto({ ...proyecto, ...patch });

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => router.push("/proyectos")}>
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>
      <PageHeader
        title={proyecto.nombre}
        subtitle={`Código ${proyecto.codigo}`}
        action={
          <div className="flex gap-2">
            <Button variant="destructive" onClick={remove}><Trash2 className="h-4 w-4" /> Eliminar</Button>
            <Button onClick={save}><Save className="h-4 w-4" /> {saved ? "Guardado" : "Guardar"}</Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Información del proyecto</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Código</Label><Input value={proyecto.codigo} onChange={(e) => set({ codigo: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Nombre</Label><Input value={proyecto.nombre} onChange={(e) => set({ nombre: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Cliente</Label>
              <Select value={proyecto.cliente_id ?? ""} onChange={(e) => set({ cliente_id: e.target.value })}>
                <option value="">— Seleccionar —</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
              </Select></div>
            <div className="space-y-1.5"><Label>Tipo</Label>
              <Select value={proyecto.tipo} onChange={(e) => set({ tipo: e.target.value })}
                options={[{ value: "construccion", label: "Construcción" }, { value: "remodelacion", label: "Remodelación" }, { value: "mantencion", label: "Mantención" }]} /></div>
            <div className="space-y-1.5"><Label>Estado</Label>
              <Select value={proyecto.estado} onChange={(e) => set({ estado: e.target.value })}
                options={[{ value: "pendiente", label: "Pendiente" }, { value: "en_proceso", label: "En proceso" }, { value: "completada", label: "Completada" }]} /></div>
            <div className="space-y-1.5"><Label>Fecha Inicio</Label><Input type="date" value={proyecto.fecha_inicio ?? ""} onChange={(e) => set({ fecha_inicio: e.target.value || null })} /></div>
            <div className="space-y-1.5"><Label>Fecha Fin Estimada</Label><Input type="date" value={proyecto.fecha_fin_estimada ?? ""} onChange={(e) => set({ fecha_fin_estimada: e.target.value || null })} /></div>
            <div className="space-y-1.5"><Label>Presupuesto Total</Label><CurrencyInput value={proyecto.presupuesto_total} onChange={(n) => set({ presupuesto_total: n })} /></div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Cotizaciones ({cotizaciones.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {cotizaciones.length === 0 && <p className="text-sm text-muted-foreground">Sin cotizaciones</p>}
              {cotizaciones.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.numero}</span>
                  <div className="text-right"><p className="font-medium">{formatCurrency(c.total)}</p><StatusBadge estado={c.estado} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Obras ({obras.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {obras.length === 0 && <p className="text-sm text-muted-foreground">Sin obras</p>}
              {obras.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span>{o.nombre}</span>
                  <div className="text-right"><p className="font-medium">{formatCurrency(o.presupuesto)}</p><StatusBadge estado={o.estado} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
