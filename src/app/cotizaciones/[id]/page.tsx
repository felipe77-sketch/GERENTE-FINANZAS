"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import type { Cotizacion, CotizacionItem, Cliente } from "@/lib/types";
import { fetchAll, insertRow, updateRow, deleteRow } from "@/lib/data";
import { nameById } from "@/lib/lookups";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const estadoOptions = [
  { value: "borrador", label: "Borrador" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobada", label: "Aprobada" },
  { value: "rechazada", label: "Rechazada" },
];

const emptyLine = { descripcion: "", unidad: "un", cantidad: 1, precio_unitario: 0 };

export default function CotizacionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cotizacion, setCotizacion] = React.useState<Cotizacion | null>(null);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [items, setItems] = React.useState<CotizacionItem[]>([]);
  const [line, setLine] = React.useState({ ...emptyLine });
  const [saved, setSaved] = React.useState(false);

  const loadItems = React.useCallback(() => {
    fetchAll<CotizacionItem>("cotizacion_items").then((rows) =>
      setItems(rows.filter((it) => it.cotizacion_id === id).sort((a, b) => a.linea - b.linea))
    );
  }, [id]);

  React.useEffect(() => {
    fetchAll<Cotizacion>("cotizaciones").then((rows) => setCotizacion(rows.find((c) => c.id === id) || null));
    fetchAll<Cliente>("clientes").then(setClientes);
    loadItems();
  }, [id, loadItems]);

  if (!cotizacion) return <p className="text-muted-foreground">Cargando cotización...</p>;

  const set = (patch: Partial<Cotizacion>) => setCotizacion({ ...cotizacion, ...patch });

  async function save() {
    if (!cotizacion) return;
    await updateRow("cotizaciones", cotizacion.id, { estado: cotizacion.estado, notas: cotizacion.notas });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function remove() {
    if (!cotizacion) return;
    if (confirm("¿Eliminar esta cotización?")) {
      await deleteRow("cotizaciones", cotizacion.id);
      router.push("/cotizaciones");
    }
  }

  async function addLine() {
    if (!line.descripcion) return;
    const nextLinea = items.reduce((m, it) => Math.max(m, it.linea), 0) + 1;
    await insertRow("cotizacion_items", {
      cotizacion_id: id,
      linea: nextLinea,
      descripcion: line.descripcion,
      unidad: line.unidad,
      cantidad: line.cantidad,
      precio_unitario: line.precio_unitario,
      subtotal: line.cantidad * line.precio_unitario,
    });
    setLine({ ...emptyLine });
    loadItems();
  }

  async function removeLine(itemId: string) {
    await deleteRow("cotizacion_items", itemId);
    loadItems();
  }

  const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
  const descuentoMonto = Math.round(subtotal * (cotizacion.descuento_pct || 0) / 100);
  const afterDesc = subtotal - descuentoMonto;
  const iva = Math.round(afterDesc * (cotizacion.impuesto_pct || 0) / 100);
  const total = afterDesc + iva;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3" onClick={() => router.push("/cotizaciones")}>
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>
      <PageHeader
        title={cotizacion.numero}
        subtitle={`${nameById(clientes, cotizacion.cliente_id, (c) => c.razon_social)} · v${cotizacion.version}`}
        action={
          <div className="flex gap-2">
            <Button variant="destructive" onClick={remove}><Trash2 className="h-4 w-4" /> Eliminar</Button>
            <Button onClick={save}><Save className="h-4 w-4" /> {saved ? "Guardado" : "Guardar"}</Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader><CardTitle>Encabezado</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={cotizacion.estado} onChange={(e) => set({ estado: e.target.value })} options={estadoOptions} />
              </div>
              <div className="space-y-1.5 flex flex-col justify-end">
                <StatusBadge estado={cotizacion.estado} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notas</Label>
                <Input value={cotizacion.notas ?? ""} onChange={(e) => set({ notas: e.target.value || null })} placeholder="Notas..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Líneas de la cotización</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left">
                      <th className="px-3 py-2 font-medium text-muted-foreground">Línea</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">Descripción</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">Unidad</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">Cant.</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">P. Unit.</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">Subtotal</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">Sin líneas</td></tr>
                    ) : items.map((it) => (
                      <tr key={it.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2">{it.linea}</td>
                        <td className="px-3 py-2">{it.descripcion}</td>
                        <td className="px-3 py-2">{it.unidad}</td>
                        <td className="px-3 py-2">{it.cantidad}</td>
                        <td className="px-3 py-2">{formatCurrency(it.precio_unitario, cotizacion.currency)}</td>
                        <td className="px-3 py-2">{formatCurrency(it.subtotal, cotizacion.currency)}</td>
                        <td className="px-3 py-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => removeLine(it.id)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1.5">
                  <Label>Descripción</Label>
                  <Input value={line.descripcion} onChange={(e) => setLine({ ...line, descripcion: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Unidad</Label>
                  <Input value={line.unidad} onChange={(e) => setLine({ ...line, unidad: e.target.value })} />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <Label>Cant.</Label>
                  <Input type="number" value={line.cantidad} onChange={(e) => setLine({ ...line, cantidad: Number(e.target.value) })} />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label>P. Unit.</Label>
                  <CurrencyInput value={line.precio_unitario} onChange={(n) => setLine({ ...line, precio_unitario: n })} />
                </div>
                <div className="col-span-1">
                  <Button onClick={addLine} disabled={!line.descripcion}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Totales</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal, cotizacion.currency)} />
              <Row label={`Descuento (${cotizacion.descuento_pct || 0}%)`} value={`- ${formatCurrency(descuentoMonto, cotizacion.currency)}`} />
              <Row label={`IVA (${cotizacion.impuesto_pct || 0}%)`} value={formatCurrency(iva, cotizacion.currency)} />
              <div className="border-t border-border pt-2 mt-2">
                <Row label="Total" value={formatCurrency(total, cotizacion.currency)} bold />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
