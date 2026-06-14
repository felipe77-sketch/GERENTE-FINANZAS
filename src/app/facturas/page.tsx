"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { Factura, Cliente, Proveedor, Proyecto } from "@/lib/types";
import { fetchAll } from "@/lib/data";
import { nameById } from "@/lib/lookups";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Modal } from "@/components/shared/Modal";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const empty: Partial<Factura> = {
  numero_folio: "", tipo: "emitida", cliente_id: null, proveedor_id: null, proyecto_id: null,
  estado: "pendiente", fecha_emision: "", fecha_vencimiento: "", neto: 0, iva: 0, total: 0, currency: "CLP",
};

type Filtro = "todas" | "emitida" | "recibida";

export default function FacturasPage() {
  const { data, create } = useCollection<Factura>("facturas");
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([]);
  const [proyectos, setProyectos] = React.useState<Proyecto[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Factura>>(empty);
  const [filtro, setFiltro] = React.useState<Filtro>("todas");

  React.useEffect(() => {
    fetchAll<Cliente>("clientes").then(setClientes);
    fetchAll<Proveedor>("proveedores").then(setProveedores);
    fetchAll<Proyecto>("proyectos").then(setProyectos);
  }, []);

  const filtered = React.useMemo(
    () => filtro === "todas" ? data : data.filter((f) => f.tipo === filtro),
    [data, filtro]
  );

  const columns: Column<Factura>[] = [
    { key: "numero_folio", header: "Folio", render: (r) => <span className="font-medium">{r.numero_folio}</span> },
    { key: "tipo", header: "Tipo", render: (r) => <span className="capitalize">{r.tipo}</span> },
    {
      key: "contraparte", header: "Contraparte",
      render: (r) => r.cliente_id
        ? nameById(clientes, r.cliente_id, (c) => c.razon_social)
        : nameById(proveedores, r.proveedor_id, (p) => p.razon_social),
    },
    { key: "fecha_emision", header: "Emisión", render: (r) => formatDate(r.fecha_emision) },
    { key: "fecha_vencimiento", header: "Vencimiento", render: (r) => formatDate(r.fecha_vencimiento) },
    { key: "total", header: "Total", render: (r) => formatCurrency(r.total, r.currency) },
    { key: "estado", header: "Estado", render: (r) => <StatusBadge estado={r.estado} /> },
  ];

  async function handleCreate() {
    const neto = form.neto ?? 0;
    const iva = Math.round(neto * 0.19);
    await create({ ...form, iva, total: neto + iva });
    setOpen(false);
    setForm(empty);
  }

  const tabs: { value: Filtro; label: string }[] = [
    { value: "emitida", label: "Emitidas" },
    { value: "recibida", label: "Recibidas" },
    { value: "todas", label: "Todas" },
  ];

  return (
    <div>
      <PageHeader
        title="Facturas"
        subtitle="Gestión de facturas emitidas y recibidas"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nueva Factura</Button>}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Buscar por folio..."
        toolbar={
          <div className="flex gap-1.5">
            {tabs.map((t) => (
              <Button key={t.value} size="sm" variant={filtro === t.value ? "default" : "outline"} onClick={() => setFiltro(t.value)}>
                {t.label}
              </Button>
            ))}
          </div>
        }
      />

      <Modal open={open} onOpenChange={setOpen} title="Nueva Factura">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Folio"><Input value={form.numero_folio} onChange={(e) => setForm({ ...form, numero_folio: e.target.value })} /></Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Factura["tipo"] })}
              options={[{ value: "emitida", label: "Emitida" }, { value: "recibida", label: "Recibida" }]} />
          </Field>
          <Field label="Cliente">
            <Select value={form.cliente_id ?? ""} onChange={(e) => setForm({ ...form, cliente_id: e.target.value || null })}>
              <option value="">— Sin asignar —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
            </Select>
          </Field>
          <Field label="Proveedor">
            <Select value={form.proveedor_id ?? ""} onChange={(e) => setForm({ ...form, proveedor_id: e.target.value || null })}>
              <option value="">— Sin asignar —</option>
              {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
            </Select>
          </Field>
          <Field label="Proyecto">
            <Select value={form.proyecto_id ?? ""} onChange={(e) => setForm({ ...form, proyecto_id: e.target.value || null })}>
              <option value="">— Sin asignar —</option>
              {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
              options={[{ value: "pendiente", label: "Pendiente" }, { value: "pagada", label: "Pagada" }, { value: "cobrada", label: "Cobrada" }, { value: "vencida", label: "Vencida" }]} />
          </Field>
          <Field label="Fecha Emisión"><Input type="date" value={form.fecha_emision ?? ""} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })} /></Field>
          <Field label="Fecha Vencimiento"><Input type="date" value={form.fecha_vencimiento ?? ""} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} /></Field>
          <Field label="Neto"><CurrencyInput value={form.neto ?? 0} onChange={(n) => setForm({ ...form, neto: n })} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!form.numero_folio}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
