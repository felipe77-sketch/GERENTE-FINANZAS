"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { Cobro, Factura, Cliente } from "@/lib/types";
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

const empty: Partial<Cobro> = {
  factura_id: null, cliente_id: null, monto: 0, fecha_programada: "",
  estado: "pendiente", metodo_pago: "transferencia", currency: "CLP",
};

export default function CobrosPage() {
  const { data, create, update } = useCollection<Cobro>("cobros");
  const [facturas, setFacturas] = React.useState<Factura[]>([]);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Cobro>>(empty);

  React.useEffect(() => {
    fetchAll<Factura>("facturas").then(setFacturas);
    fetchAll<Cliente>("clientes").then(setClientes);
  }, []);

  const columns: Column<Cobro>[] = [
    { key: "factura_id", header: "Factura", render: (r) => nameById(facturas, r.factura_id, (f) => f.numero_folio) },
    { key: "cliente_id", header: "Cliente", render: (r) => nameById(clientes, r.cliente_id, (c) => c.razon_social) },
    { key: "monto", header: "Monto", render: (r) => formatCurrency(r.monto, r.currency) },
    { key: "fecha_programada", header: "Programada", render: (r) => formatDate(r.fecha_programada) },
    { key: "fecha_cobrado", header: "Cobrado", render: (r) => formatDate(r.fecha_cobrado) },
    { key: "metodo_pago", header: "Método", render: (r) => r.metodo_pago ?? "—" },
    { key: "estado", header: "Estado", render: (r) => <StatusBadge estado={r.estado} /> },
    {
      key: "accion", header: "",
      render: (r) => r.estado !== "cobrado" ? (
        <Button size="sm" variant="outline" onClick={() => update(r.id, { estado: "cobrado", fecha_cobrado: new Date().toISOString().slice(0, 10) })}>
          Marcar cobrado
        </Button>
      ) : null,
    },
  ];

  async function handleCreate() {
    await create(form);
    setOpen(false);
    setForm(empty);
  }

  return (
    <div>
      <PageHeader
        title="Cobros"
        subtitle="Gestión de cobros a clientes"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuevo Cobro</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar..."
      />

      <Modal open={open} onOpenChange={setOpen} title="Nuevo Cobro">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Factura" full>
            <Select value={form.factura_id ?? ""} onChange={(e) => setForm({ ...form, factura_id: e.target.value || null })}>
              <option value="">— Sin asignar —</option>
              {facturas.map((f) => <option key={f.id} value={f.id}>{f.numero_folio}</option>)}
            </Select>
          </Field>
          <Field label="Cliente">
            <Select value={form.cliente_id ?? ""} onChange={(e) => setForm({ ...form, cliente_id: e.target.value || null })}>
              <option value="">— Sin asignar —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
            </Select>
          </Field>
          <Field label="Monto"><CurrencyInput value={form.monto ?? 0} onChange={(n) => setForm({ ...form, monto: n })} /></Field>
          <Field label="Fecha Programada"><Input type="date" value={form.fecha_programada ?? ""} onChange={(e) => setForm({ ...form, fecha_programada: e.target.value })} /></Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
              options={[{ value: "pendiente", label: "Pendiente" }, { value: "cobrado", label: "Cobrado" }, { value: "atrasada", label: "Atrasada" }]} />
          </Field>
          <Field label="Método de Pago">
            <Select value={form.metodo_pago ?? ""} onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
              options={[{ value: "transferencia", label: "Transferencia" }, { value: "cheque", label: "Cheque" }, { value: "efectivo", label: "Efectivo" }]} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!form.cliente_id}>Guardar</Button>
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
