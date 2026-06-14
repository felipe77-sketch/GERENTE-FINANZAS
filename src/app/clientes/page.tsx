"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useCollection } from "@/hooks/useSupabase";
import type { Cliente, Personal } from "@/lib/types";
import { fetchAll } from "@/lib/data";
import { nameById } from "@/lib/lookups";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const empty: Partial<Cliente> = {
  rut: "", razon_social: "", tipo: "empresa", email: "", telefono: "",
  condicion_pago: "30 días", estado: "activo", ejecutivo_id: null,
};

export default function ClientesPage() {
  const router = useRouter();
  const { data, create } = useCollection<Cliente>("clientes");
  const [personal, setPersonal] = React.useState<Personal[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Cliente>>(empty);

  React.useEffect(() => { fetchAll<Personal>("personal").then(setPersonal); }, []);

  const columns: Column<Cliente>[] = [
    { key: "razon_social", header: "Razón Social", render: (r) => <span className="font-medium">{r.razon_social}</span> },
    { key: "rut", header: "RUT" },
    { key: "tipo", header: "Tipo", render: (r) => <span className="capitalize">{r.tipo}</span> },
    { key: "email", header: "Email" },
    { key: "condicion_pago", header: "Cond. Pago" },
    { key: "ejecutivo_id", header: "Ejecutivo", render: (r) => nameById(personal, r.ejecutivo_id, (p) => `${p.nombre} ${p.apellido}`) },
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
        title="Clientes"
        subtitle="Gestión de la cartera de clientes"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuevo Cliente</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por razón social, RUT, email..."
        onRowClick={(r) => router.push(`/clientes/${r.id}`)}
      />

      <Modal open={open} onOpenChange={setOpen} title="Nuevo Cliente">
        <div className="grid grid-cols-2 gap-3">
          <Field label="RUT"><Input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="76.123.456-7" /></Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              options={[{ value: "empresa", label: "Empresa" }, { value: "persona", label: "Persona" }, { value: "publico", label: "Público" }]} />
          </Field>
          <Field label="Razón Social" full><Input value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Teléfono"><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
          <Field label="Condición de Pago">
            <Select value={form.condicion_pago} onChange={(e) => setForm({ ...form, condicion_pago: e.target.value })}
              options={["contado", "30 días", "45 días", "60 días", "90 días"].map((v) => ({ value: v, label: v }))} />
          </Field>
          <Field label="Ejecutivo">
            <Select value={form.ejecutivo_id ?? ""} onChange={(e) => setForm({ ...form, ejecutivo_id: e.target.value || null })}>
              <option value="">— Sin asignar —</option>
              {personal.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
              options={[{ value: "activo", label: "Activo" }, { value: "inactivo", label: "Inactivo" }]} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!form.razon_social}>Guardar</Button>
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
