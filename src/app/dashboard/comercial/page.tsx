"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchAll } from "@/lib/data";
import { formatCurrency, formatCompact } from "@/lib/utils";
import type { Cotizacion } from "@/lib/types";

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

const ESTADOS = ["pendiente", "en_revision", "aprobada", "rechazada"];
const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};
const COLORS: Record<string, string> = {
  pendiente: "#f59e0b",
  en_revision: "#3b82f6",
  aprobada: "#22c55e",
  rechazada: "#ef4444",
};

export default function ComercialDashboard() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);

  useEffect(() => {
    fetchAll<Cotizacion>("cotizaciones").then(setCotizaciones);
  }, []);

  const kpis = useMemo(() => {
    const total = cotizaciones.length;
    const aprobadas = cotizaciones.filter((q) => q.estado === "aprobada");
    const tasa = total > 0 ? (aprobadas.length / total) * 100 : 0;
    const montoAprobado = aprobadas.reduce((s, q) => s + q.total, 0);
    const montoTotal = cotizaciones.reduce((s, q) => s + q.total, 0);
    const ticket = total > 0 ? montoTotal / total : 0;
    return { total, tasa, montoAprobado, ticket };
  }, [cotizaciones]);

  const byEstado = useMemo(() => {
    return ESTADOS.map((e) => {
      const rows = cotizaciones.filter((q) => q.estado === e);
      return {
        estado: e,
        label: ESTADO_LABEL[e],
        count: rows.length,
        monto: rows.reduce((s, q) => s + q.total, 0),
        color: COLORS[e],
      };
    });
  }, [cotizaciones]);

  return (
    <div className="space-y-6">
      <PageHeader title="Comercial" subtitle="Dupplo OS V1 · Cotizaciones y conversión" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total cotizaciones" value={String(kpis.total)} />
        <KpiCard label="Tasa conversión" value={`${kpis.tasa.toFixed(1)}%`} sub="Aprobadas / total" />
        <KpiCard label="Monto aprobado" value={formatCurrency(kpis.montoAprobado)} />
        <KpiCard label="Ticket promedio" value={formatCurrency(kpis.ticket)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={byEstado} margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {byEstado.map((d) => (
                    <Cell key={d.estado} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byEstado.filter((d) => d.count > 0)}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {byEstado
                    .filter((d) => d.count > 0)
                    .map((d) => (
                      <Cell key={d.estado} fill={d.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monto total por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byEstado} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tickFormatter={formatCompact} tick={{ fontSize: 12, fill: "#64748b" }} width={60} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
                {byEstado.map((d) => (
                  <Cell key={d.estado} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
