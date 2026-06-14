"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { Cotizacion, Cliente, Proyecto } from "@/lib/types";
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

interface CotizForm {
  numero: string;
  cliente_id: string;
  proyecto_id: string | null;
  estado: string;
  fecha_emision: string;
  fecha_validez: string;
  descuento_pct: number;
  impuesto_pct: number;
  subtotal: number;
}

const empty: CotizForm = {
  numero: "", cliente_id: "", proyecto_id: null, estado: "borrador",
  fecha_emision: "", fecha_validez: "", descuento_pct: 0, impuesto_pct: 19, subtotal: 0,
};

const estadoOptions = [
  { value: "borrador", label: "Borrador" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "aprobada", label: "Aprobada" },
  { value: "rechazada", label: "Rechazada" },
];

export default function CotizacionesPage() {
  const router = useRouter();
  const { data, create } = useCollection<Cotizacion>("cotizaciones");
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [proyectos, setProyectos] = React.useState<Proyecto[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<CotizForm>(empty);

  React.useEffect(() => {
    fetchAll<Cliente>("clientes").then(setClientes);
    fetchAll<Proyecto>("proyectos").then(setProyectos);
  }, []);

  const columns: Column<Cotizacion>[] = [
    { key: "numero", header: "Número", render: (r) => <span className="font-medium">{r.numero}</span> },
    { key: "cliente_id", header: "Cliente", render: (r) => nameById(clientes, r.cliente_id, (c) => c.razon_social), searchValue: (r) => nameById(clientes, r.cliente_id, (c) => c.razon_social) },
    { key: "version", header: "Versión", render: (r) => `v${r.version}` },
    { key: "fecha_emision", header: "Emisión", render: (r) => formatDate(r.fecha_emision) },
    { key: "total", header: "Total", render: (r) => formatCurrency(r.total, r.currency) },
    { key: "estado", header: "Estado", render: (r) => <StatusBadge estado={r.estado} /> },
  ];

  async function handleCreate() {
    const afterDesc = form.subtotal * (1 - (form.descuento_pct || 0) / 100);
    const impuesto_monto = Math.round(afterDesc * (form.impuesto_pct || 0) / 100);
    const total = afterDesc + impuesto_monto;
    await create({
      numero: form.numero,
      cliente_id: form.cliente_id,
      proyecto_id: form.proyecto_id || null,
      version: 1,
      estado: form.estado,
      fecha_emision: form.fecha_emision || null,
      fecha_validez: form.fecha_validez || null,
      subtotal: form.subtotal,
      descuento_pct: form.descuento_pct || 0,
      impuesto_pct: form.impuesto_pct || 0,
      impuesto_monto,
      total,
      currency: "CLP",
      notas: null,
    });
    setOpen(false);
    setForm(empty);
  }

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        subtitle="Gestión de cotizaciones"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nueva Cotización</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por número, cliente..."
        onRowClick={(r) => router.push(`/cotizaciones/${r.id}`)}
      />

      <Modal open={open} onOpenChange={setOpen} title="Nueva Cotización">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Número"><Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="COT-2026-001" /></Field>
          <Field label="Cliente">
            <Select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
              <option value="">— Seleccionar —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
            </Select>
          </Field>
          <Field label="Proyecto">
            <Select value={form.proyecto_id ?? ""} onChange={(e) => setForm({ ...form, proyecto_id: e.target.value || null })}>
              <option value="">— Ninguno —</option>
              {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} options={estadoOptions} />
          </Field>
          <Field label="Fecha Emisión"><Input type="date" value={form.fecha_emision} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })} /></Field>
          <Field label="Fecha Validez"><Input type="date" value={form.fecha_validez} onChange={(e) => setForm({ ...form, fecha_validez: e.target.value })} /></Field>
          <Field label="Descuento %"><Input type="number" value={form.descuento_pct} onChange={(e) => setForm({ ...form, descuento_pct: Number(e.target.value) })} /></Field>
          <Field label="Impuesto %"><Input type="number" value={form.impuesto_pct} onChange={(e) => setForm({ ...form, impuesto_pct: Number(e.target.value) })} /></Field>
          <Field label="Subtotal" full><CurrencyInput value={form.subtotal} onChange={(n) => setForm({ ...form, subtotal: n })} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!form.numero || !form.cliente_id}>Guardar</Button>
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
