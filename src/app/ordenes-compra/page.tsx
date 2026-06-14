"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { OrdenCompra, Cliente, Proveedor, Proyecto } from "@/lib/types";
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

const empty: Partial<OrdenCompra> = {
  numero: "", tipo: "cliente", proyecto_id: null, cliente_id: null, proveedor_id: null,
  estado: "pendiente", fecha_emision: "", total: 0, currency: "CLP",
};

export default function OrdenesCompraPage() {
  const { data, create } = useCollection<OrdenCompra>("ordenes_compra");
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([]);
  const [proyectos, setProyectos] = React.useState<Proyecto[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<Partial<OrdenCompra>>(empty);

  React.useEffect(() => {
    fetchAll<Cliente>("clientes").then(setClientes);
    fetchAll<Proveedor>("proveedores").then(setProveedores);
    fetchAll<Proyecto>("proyectos").then(setProyectos);
  }, []);

  const columns: Column<OrdenCompra>[] = [
    { key: "numero", header: "Número", render: (r) => <span className="font-medium">{r.numero}</span> },
    { key: "tipo", header: "Tipo", render: (r) => <span className="capitalize">{r.tipo}</span> },
    {
      key: "contraparte", header: "Contraparte",
      render: (r) => r.tipo === "cliente"
        ? nameById(clientes, r.cliente_id, (c) => c.razon_social)
        : nameById(proveedores, r.proveedor_id, (p) => p.razon_social),
    },
    { key: "proyecto_id", header: "Proyecto", render: (r) => nameById(proyectos, r.proyecto_id, (p) => p.nombre) },
    { key: "fecha_emision", header: "Emisión", render: (r) => formatDate(r.fecha_emision) },
    { key: "total", header: "Total", render: (r) => formatCurrency(r.total, r.currency) },
    { key: "estado", header: "Estado", render: (r) => <StatusBadge estado={r.estado} /> },
  ];

  async function handleCreate() {
    await create(form);
    setOpen(false);
    setForm(empty);
  }

  return (
    <div>
      <PageHeader
        title="Órdenes de Compra"
        subtitle="Gestión de órdenes de compra"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nueva Orden</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por número..."
      />

      <Modal open={open} onOpenChange={setOpen} title="Nueva Orden de Compra">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Número"><Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as OrdenCompra["tipo"] })}
              options={[{ value: "cliente", label: "Cliente" }, { value: "proveedor", label: "Proveedor" }]} />
          </Field>
          <Field label="Proyecto">
            <Select value={form.proyecto_id ?? ""} onChange={(e) => setForm({ ...form, proyecto_id: e.target.value || null })}>
              <option value="">— Sin asignar —</option>
              {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
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
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
              options={[{ value: "pendiente", label: "Pendiente" }, { value: "en_proceso", label: "En proceso" }, { value: "aprobada", label: "Aprobada" }, { value: "rechazada", label: "Rechazada" }]} />
          </Field>
          <Field label="Fecha Emisión"><Input type="date" value={form.fecha_emision ?? ""} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })} /></Field>
          <Field label="Total"><CurrencyInput value={form.total ?? 0} onChange={(n) => setForm({ ...form, total: n })} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!form.numero}>Guardar</Button>
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
