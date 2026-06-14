"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { Cliente, Proyecto, Factura } from "@/lib/types";
import { fetchAll, updateRow, deleteRow } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cliente, setCliente] = React.useState<Cliente | null>(null);
  const [proyectos, setProyectos] = React.useState<Proyecto[]>([]);
  const [facturas, setFacturas] = React.useState<Factura[]>([]);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    fetchAll<Cliente>("clientes").then((rows) => setCliente(rows.find((c) => c.id === id) || null));
    fetchAll<Proyecto>("proyectos").then((rows) => setProyectos(rows.filter((p) => p.cliente_id === id)));
    fetchAll<Factura>("facturas").then((rows) => setFacturas(rows.filter((f) => f.cliente_id === id)));
  }, [id]);

  if (!cliente) return <p className="text-muted-foreground">Cargando cliente...</p>;

  async function save() {
    if (!cliente) return;
    await updateRow("clientes", cliente.id, cliente);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  async function remove() {
    if (!cliente) return;
    if (confirm("¿Eliminar este cliente?")) {
      await deleteRow("clientes", cliente.id);
      router.push("/clientes");
    }
  }

  const set = (patch: Partial<Cliente>) => setCliente({ ...cliente, ...patch });

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => router.push("/clientes")}>
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>
      <PageHeader
        title={cliente.razon_social}
        subtitle={`RUT ${cliente.rut}`}
        action={
          <div className="flex gap-2">
            <Button variant="destructive" onClick={remove}><Trash2 className="h-4 w-4" /> Eliminar</Button>
            <Button onClick={save}><Save className="h-4 w-4" /> {saved ? "Guardado" : "Guardar"}</Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Información del cliente</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Razón Social</Label><Input value={cliente.razon_social} onChange={(e) => set({ razon_social: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>RUT</Label><Input value={cliente.rut} onChange={(e) => set({ rut: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={cliente.email} onChange={(e) => set({ email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Teléfono</Label><Input value={cliente.telefono} onChange={(e) => set({ telefono: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Tipo</Label>
              <Select value={cliente.tipo} onChange={(e) => set({ tipo: e.target.value })}
                options={["empresa", "persona", "publico"].map((v) => ({ value: v, label: v }))} /></div>
            <div className="space-y-1.5"><Label>Condición de Pago</Label>
              <Select value={cliente.condicion_pago} onChange={(e) => set({ condicion_pago: e.target.value })}
                options={["contado", "30 días", "45 días", "60 días", "90 días"].map((v) => ({ value: v, label: v }))} /></div>
            <div className="space-y-1.5"><Label>Estado</Label>
              <Select value={cliente.estado} onChange={(e) => set({ estado: e.target.value })}
                options={["activo", "inactivo"].map((v) => ({ value: v, label: v }))} /></div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Proyectos ({proyectos.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {proyectos.length === 0 && <p className="text-sm text-muted-foreground">Sin proyectos</p>}
              {proyectos.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.nombre}</span><StatusBadge estado={p.estado} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Facturas ({facturas.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {facturas.length === 0 && <p className="text-sm text-muted-foreground">Sin facturas</p>}
              {facturas.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm">
                  <div><p>{f.numero_folio}</p><p className="text-xs text-muted-foreground">{formatDate(f.fecha_emision)}</p></div>
                  <div className="text-right"><p className="font-medium">{formatCurrency(f.total)}</p><StatusBadge estado={f.estado} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
