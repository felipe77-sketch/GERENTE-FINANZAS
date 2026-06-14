"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { Proveedor } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const empty: Partial<Proveedor> = {
  rut: "", razon_social: "", tipo: "empresa", categoria: "Materiales", email: "",
  telefono: "", condicion_pago: "30 días", estado: "activo",
};

export default function ProveedoresPage() {
  const { data, create, update } = useCollection<Proveedor>("proveedores");
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<Partial<Proveedor>>(empty);

  const columns: Column<Proveedor>[] = [
    { key: "razon_social", header: "Razón Social", render: (r) => <span className="font-medium">{r.razon_social}</span> },
    { key: "rut", header: "RUT" },
    { key: "categoria", header: "Categoría" },
    { key: "email", header: "Email" },
    { key: "telefono", header: "Teléfono" },
    { key: "condicion_pago", header: "Cond. Pago" },
    { key: "estado", header: "Estado", render: (r) => <StatusBadge estado={r.estado} /> },
  ];

  function openCreate() {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(r: Proveedor) {
    setEditId(r.id);
    setForm(r);
    setOpen(true);
  }
  async function handleSave() {
    if (editId) {
      await update(editId, form);
    } else {
      await create(form);
    }
    setOpen(false);
    setEditId(null);
    setForm(empty);
  }

  return (
    <div>
      <PageHeader
        title="Proveedores"
        subtitle="Gestión de proveedores"
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo Proveedor</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por razón social, RUT, email..."
        onRowClick={(r) => openEdit(r)}
      />

      <Modal open={open} onOpenChange={setOpen} title={editId ? "Editar Proveedor" : "Nuevo Proveedor"}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="RUT"><Input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="76.123.456-7" /></Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              options={[{ value: "empresa", label: "Empresa" }, { value: "persona", label: "Persona" }]} />
          </Field>
          <Field label="Razón Social" full><Input value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} /></Field>
          <Field label="Categoría">
            <Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              options={["Materiales", "Maquinaria", "Subcontrato", "Servicios"].map((v) => ({ value: v, label: v }))} />
          </Field>
          <Field label="Condición de Pago">
            <Select value={form.condicion_pago} onChange={(e) => setForm({ ...form, condicion_pago: e.target.value })}
              options={["contado", "30 días", "45 días", "60 días"].map((v) => ({ value: v, label: v }))} />
          </Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Teléfono"><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
              options={[{ value: "activo", label: "Activo" }, { value: "inactivo", label: "Inactivo" }]} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.razon_social}>Guardar</Button>
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
