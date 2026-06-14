"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { Proyecto, Cliente } from "@/lib/types";
import { fetchAll } from "@/lib/data";
import { nameById } from "@/lib/lookups";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Modal } from "@/components/shared/Modal";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const empty: Partial<Proyecto> = {
  codigo: "", nombre: "", cliente_id: "", tipo: "construccion", estado: "pendiente",
  fecha_inicio: null, fecha_fin_estimada: null, presupuesto_total: 0,
};

export default function ProyectosPage() {
  const router = useRouter();
  const { data, create } = useCollection<Proyecto>("proyectos");
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Proyecto>>(empty);

  React.useEffect(() => { fetchAll<Cliente>("clientes").then(setClientes); }, []);

  const columns: Column<Proyecto>[] = [
    { key: "codigo", header: "Código", render: (r) => <span className="font-medium">{r.codigo}</span> },
    { key: "nombre", header: "Nombre" },
    { key: "cliente_id", header: "Cliente", render: (r) => nameById(clientes, r.cliente_id, (c) => c.razon_social) },
    { key: "tipo", header: "Tipo", render: (r) => <span className="capitalize">{r.tipo}</span> },
    { key: "presupuesto_total", header: "Presupuesto", render: (r) => formatCurrency(r.presupuesto_total) },
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
        title="Proyectos"
        subtitle="Gestión de proyectos"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuevo Proyecto</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por código, nombre..."
        onRowClick={(r) => router.push(`/proyectos/${r.id}`)}
      />

      <Modal open={open} onOpenChange={setOpen} title="Nuevo Proyecto">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Código"><Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="PRY-001" /></Field>
          <Field label="Nombre"><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
          <Field label="Cliente" full>
            <Select value={form.cliente_id ?? ""} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
              <option value="">— Seleccionar —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
            </Select>
          </Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              options={[{ value: "construccion", label: "Construcción" }, { value: "remodelacion", label: "Remodelación" }, { value: "mantencion", label: "Mantención" }]} />
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
              options={[{ value: "pendiente", label: "Pendiente" }, { value: "en_proceso", label: "En proceso" }, { value: "completada", label: "Completada" }]} />
          </Field>
          <Field label="Fecha Inicio"><Input type="date" value={form.fecha_inicio ?? ""} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value || null })} /></Field>
          <Field label="Fecha Fin Estimada"><Input type="date" value={form.fecha_fin_estimada ?? ""} onChange={(e) => setForm({ ...form, fecha_fin_estimada: e.target.value || null })} /></Field>
          <Field label="Presupuesto Total" full><CurrencyInput value={form.presupuesto_total ?? 0} onChange={(n) => setForm({ ...form, presupuesto_total: n })} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!form.nombre}>Guardar</Button>
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
