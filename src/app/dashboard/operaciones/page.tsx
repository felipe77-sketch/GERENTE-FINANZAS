"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchAll } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { nameById } from "@/lib/lookups";
import type { Obra, Personal } from "@/lib/types";

const ACCENT = "#3b82f6";
const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#14b8a6"];

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5 pt-5">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {sub ? <div className="mt-1 text-xs text-slate-400">{sub}</div> : null}
      </CardContent>
    </Card>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const v = Math.max(0, Math.min(100, pct || 0));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs tabular-nums text-slate-600">{v}%</span>
    </div>
  );
}

export default function OperacionesDashboard() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [personal, setPersonal] = useState<Personal[]>([]);

  useEffect(() => {
    Promise.all([fetchAll<Obra>("obras"), fetchAll<Personal>("personal")]).then(([o, p]) => {
      setObras(o);
      setPersonal(p);
    });
  }, []);

  const kpis = useMemo(() => {
    const activas = obras.filter((o) => o.estado === "en_proceso");
    const avance = activas.length
      ? activas.reduce((s, o) => s + (o.avance_pct || 0), 0) / activas.length
      : 0;
    const personalActivo = personal.filter((p) => p.estado === "activo").length;
    const presEjecucion = activas.reduce((s, o) => s + (o.presupuesto || 0), 0);
    return { activas: activas.length, avance, personalActivo, presEjecucion };
  }, [obras, personal]);

  const avancePorObra = useMemo(
    () => obras.map((o) => ({ obra: o.codigo, avance: o.avance_pct || 0 })),
    [obras]
  );

  const personalPorDepto = useMemo(() => {
    const byDept = new Map<string, number>();
    for (const p of personal) {
      const d = p.departamento || "Sin asignar";
      byDept.set(d, (byDept.get(d) || 0) + 1);
    }
    return Array.from(byDept.entries()).map(([departamento, count]) => ({ departamento, count }));
  }, [personal]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Operaciones" subtitle="Dupplo OS V1 · Obras y equipo" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Obras activas" value={String(kpis.activas)} sub="En proceso" />
        <KpiCard label="Avance promedio" value={`${kpis.avance.toFixed(1)}%`} sub="Obras activas" />
        <KpiCard label="Personal activo" value={String(kpis.personalActivo)} sub="Colaboradores" />
        <KpiCard
          label="Presupuesto en ejecución"
          value={formatCurrency(kpis.presEjecucion)}
          sub="Obras activas"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Obras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4 font-medium">Código</th>
                  <th className="py-2 pr-4 font-medium">Nombre</th>
                  <th className="py-2 pr-4 font-medium">Estado</th>
                  <th className="py-2 pr-4 font-medium">Avance</th>
                  <th className="py-2 pr-4 font-medium">Jefe de obra</th>
                  <th className="py-2 pr-4 text-right font-medium">Presupuesto</th>
                </tr>
              </thead>
              <tbody>
                {obras.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-700">{o.codigo}</td>
                    <td className="py-3 pr-4 text-slate-600">{o.nombre}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge estado={o.estado} />
                    </td>
                    <td className="py-3 pr-4">
                      <ProgressBar pct={o.avance_pct} />
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {nameById(personal, o.jefe_obra_id, (p) => `${p.nombre} ${p.apellido}`)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-slate-700">
                      {formatCurrency(o.presupuesto)}
                    </td>
                  </tr>
                ))}
                {obras.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Sin obras registradas.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avance por obra</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avancePorObra} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="obra" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  width={44}
                />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="avance" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal por departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={personalPorDepto}
                  dataKey="count"
                  nameKey="departamento"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(e: { departamento: string; count: number }) =>
                    `${e.departamento} (${e.count})`
                  }
                >
                  {personalPorDepto.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
