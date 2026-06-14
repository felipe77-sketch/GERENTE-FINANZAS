"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { Personal } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const empty: Partial<Personal> = {
  rut: "", nombre: "", apellido: "", email_corporativo: "", cargo: "",
  departamento: "Comercial", tipo_contrato: "indefinido", fecha_ingreso: "", estado: "activo",
};

const departamentoOptions = ["Comercial", "Operaciones", "Finanzas", "Administración", "Dirección"].map((v) => ({ value: v, label: v }));
const contratoOptions = [
  { value: "indefinido", label: "Indefinido" },
  { value: "plazo_fijo", label: "Plazo fijo" },
  { value: "honorarios", label: "Honorarios" },
];
const estadoOptions = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

export default function PersonalPage() {
  const { data, create, update } = useCollection<Personal>("personal");
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<Partial<Personal>>(empty);

  const columns: Column<Personal>[] = [
    { key: "nombre", header: "Nombre", render: (r) => <span className="font-medium">{r.nombre} {r.apellido}</span>, searchValue: (r) => `${r.nombre} ${r.apellido}` },
    { key: "rut", header: "RUT" },
    { key: "cargo", header: "Cargo" },
    { key: "departamento", header: "Departamento" },
    { key: "tipo_contrato", header: "Contrato", render: (r) => <span className="capitalize">{r.tipo_contrato.replace("_", " ")}</span> },
    { key: "fecha_ingreso", header: "Ingreso", render: (r) => formatDate(r.fecha_ingreso) },
    { key: "estado", header: "Estado", render: (r) => <StatusBadge estado={r.estado} /> },
  ];

  function openCreate() {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(r: Personal) {
    setEditId(r.id);
    setForm({ ...r });
    setOpen(true);
  }

  async function handleSave() {
    const payload = { ...form, fecha_ingreso: form.fecha_ingreso || null };
    if (editId) {
      await update(editId, payload);
    } else {
      await create(payload);
    }
    setOpen(false);
    setForm(empty);
    setEditId(null);
  }

  return (
    <div>
      <PageHeader
        title="Personal"
        subtitle="Gestión de colaboradores"
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por nombre, RUT, cargo..."
        onRowClick={openEdit}
      />

      <Modal open={open} onOpenChange={setOpen} title={editId ? "Editar Personal" : "Nuevo Personal"}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="RUT"><Input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" /></Field>
          <Field label="Email Corporativo"><Input value={form.email_corporativo} onChange={(e) => setForm({ ...form, email_corporativo: e.target.value })} /></Field>
          <Field label="Nombre"><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
          <Field label="Apellido"><Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} /></Field>
          <Field label="Cargo"><Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} /></Field>
          <Field label="Departamento">
            <Select value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} options={departamentoOptions} />
          </Field>
          <Field label="Tipo de Contrato">
            <Select value={form.tipo_contrato} onChange={(e) => setForm({ ...form, tipo_contrato: e.target.value })} options={contratoOptions} />
          </Field>
          <Field label="Fecha de Ingreso"><Input type="date" value={form.fecha_ingreso ?? ""} onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })} /></Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} options={estadoOptions} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.nombre || !form.apellido}>Guardar</Button>
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
