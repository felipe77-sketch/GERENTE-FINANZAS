"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { Obra, Cliente, Proyecto, Personal } from "@/lib/types";
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

const empty: Partial<Obra> = {
  codigo: "", nombre: "", proyecto_id: null, cliente_id: null, tipo: "edificacion",
  estado: "pendiente", direccion: "", fecha_inicio_plan: "", fecha_fin_plan: "",
  presupuesto: 0, costo_real: 0, avance_pct: 0, jefe_obra_id: null,
};

export default function ObrasPage() {
  const router = useRouter();
  const { data, create } = useCollection<Obra>("obras");
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [proyectos, setProyectos] = React.useState<Proyecto[]>([]);
  const [personal, setPersonal] = React.useState<Personal[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Obra>>(empty);

  React.useEffect(() => {
    fetchAll<Cliente>("clientes").then(setClientes);
    fetchAll<Proyecto>("proyectos").then(setProyectos);
    fetchAll<Personal>("personal").then(setPersonal);
  }, []);

  const columns: Column<Obra>[] = [
    { key: "codigo", header: "Código", render: (r) => <span className="font-medium">{r.codigo}</span> },
    { key: "nombre", header: "Nombre" },
    { key: "cliente_id", header: "Cliente", render: (r) => nameById(clientes, r.cliente_id, (c) => c.razon_social) },
    {
      key: "avance_pct", header: "Avance",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, r.avance_pct))}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{r.avance_pct}%</span>
        </div>
      ),
    },
    { key: "presupuesto", header: "Presupuesto", render: (r) => formatCurrency(r.presupuesto) },
    { key: "estado", header: "Estado", render: (r) => <StatusBadge estado={r.estado} /> },
    { key: "jefe_obra_id", header: "Jefe", render: (r) => nameById(personal, r.jefe_obra_id, (p) => `${p.nombre} ${p.apellido}`) },
  ];

  async function handleCreate() {
    await create(form);
    setOpen(false);
    setForm(empty);
  }

  return (
    <div>
      <PageHeader
        title="Obras"
        subtitle="Gestión y avance de obras"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nueva Obra</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por código o nombre..."
        onRowClick={(r) => router.push(`/obras/${r.id}`)}
      />

      <Modal open={open} onOpenChange={setOpen} title="Nueva Obra">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Código"><Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} /></Field>
          <Field label="Nombre"><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
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
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              options={[{ value: "edificacion", label: "Edificación" }, { value: "remodelacion", label: "Remodelación" }, { value: "obra_civil", label: "Obra civil" }]} />
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
              options={[{ value: "pendiente", label: "Pendiente" }, { value: "en_proceso", label: "En proceso" }, { value: "completada", label: "Completada" }]} />
          </Field>
          <Field label="Dirección" full><Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></Field>
          <Field label="Fecha Inicio Plan"><Input type="date" value={form.fecha_inicio_plan ?? ""} onChange={(e) => setForm({ ...form, fecha_inicio_plan: e.target.value })} /></Field>
          <Field label="Fecha Fin Plan"><Input type="date" value={form.fecha_fin_plan ?? ""} onChange={(e) => setForm({ ...form, fecha_fin_plan: e.target.value })} /></Field>
          <Field label="Presupuesto"><CurrencyInput value={form.presupuesto ?? 0} onChange={(n) => setForm({ ...form, presupuesto: n })} /></Field>
          <Field label="Avance %"><Input type="number" value={form.avance_pct ?? 0} onChange={(e) => setForm({ ...form, avance_pct: Number(e.target.value) })} /></Field>
          <Field label="Jefe de Obra">
            <Select value={form.jefe_obra_id ?? ""} onChange={(e) => setForm({ ...form, jefe_obra_id: e.target.value || null })}>
              <option value="">— Sin asignar —</option>
              {personal.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!form.codigo}>Guardar</Button>
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
